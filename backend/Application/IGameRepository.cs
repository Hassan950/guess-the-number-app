using GuessTheNumber.Domain;

namespace GuessTheNumber.Application;

public interface IGameRepository
{
    Task<GameRound> CreateRoundAsync(GameRound round);
    Task<GameRound?> GetRoundAsync(int roundId);
    Task<User?> GetUserAsync(int userId);
    Task SaveChangesAsync();
}
