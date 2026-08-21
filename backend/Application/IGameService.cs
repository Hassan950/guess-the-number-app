using System.Text.Json.Serialization;

namespace GuessTheNumber.Application;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GuessOutcome
{
    Higher,
    Lower,
    Correct
}

public record StartRoundResponse(int RoundId);

public record GuessResponse(GuessOutcome Outcome, int GuessCount, int? BestGuessCount);

public interface IGameService
{
    Task<StartRoundResponse> StartRoundAsync(int userId);

    /// <returns>null if the round doesn't exist, isn't the caller's, or is already complete.</returns>
    Task<GuessResponse?> SubmitGuessAsync(int userId, int roundId, int guess);
}
