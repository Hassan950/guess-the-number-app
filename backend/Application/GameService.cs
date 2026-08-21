using GuessTheNumber.Domain;

namespace GuessTheNumber.Application;

public class GameService(IGameRepository repository) : IGameService
{
    public async Task<StartRoundResponse> StartRoundAsync(int userId)
    {
        var round = new GameRound
        {
            UserId = userId,
            SecretNumber = Random.Shared.Next(1, 44),
            Status = GameRoundStatus.InProgress,
            StartedAt = DateTime.UtcNow
        };

        var created = await repository.CreateRoundAsync(round);
        return new StartRoundResponse(created.Id);
    }

    public async Task<GuessResponse?> SubmitGuessAsync(int userId, int roundId, int guess)
    {
        var round = await repository.GetRoundAsync(roundId);
        if (round is null || round.UserId != userId || round.Status != GameRoundStatus.InProgress)
        {
            return null;
        }

        round.GuessCount++;

        var outcome = guess < round.SecretNumber ? GuessOutcome.Higher
            : guess > round.SecretNumber ? GuessOutcome.Lower
            : GuessOutcome.Correct;

        int? bestGuessCount = null;
        if (outcome == GuessOutcome.Correct)
        {
            round.Status = GameRoundStatus.Won;
            round.CompletedAt = DateTime.UtcNow;

            var user = await repository.GetUserAsync(userId);
            if (user is not null)
            {
                if (user.BestGuessCount is null || round.GuessCount < user.BestGuessCount)
                {
                    user.BestGuessCount = round.GuessCount;
                }
                bestGuessCount = user.BestGuessCount;
            }
        }

        await repository.SaveChangesAsync();

        return new GuessResponse(outcome, round.GuessCount, bestGuessCount);
    }
}
