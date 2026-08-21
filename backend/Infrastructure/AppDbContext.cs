using GuessTheNumber.Domain;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Infrastructure;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<GameRound> GameRounds => Set<GameRound>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.FirebaseUid).IsUnique();
        });

        modelBuilder.Entity<GameRound>(entity =>
        {
            entity.Property(g => g.Status).HasConversion<string>();
            entity.HasIndex(g => g.UserId);
        });
    }
}
