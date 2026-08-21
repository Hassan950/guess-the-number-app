using GuessTheNumber.Application;
using GuessTheNumber.Domain;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Infrastructure;

public class EfGameRepository(AppDbContext db) : IGameRepository
{
    public async Task<GameRound> CreateRoundAsync(GameRound round)
    {
        db.GameRounds.Add(round);
        await db.SaveChangesAsync();
        return round;
    }

    public Task<GameRound?> GetRoundAsync(int roundId) =>
        db.GameRounds.SingleOrDefaultAsync(r => r.Id == roundId);

    public Task<User?> GetUserAsync(int userId) =>
        db.Users.SingleOrDefaultAsync(u => u.Id == userId);

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
