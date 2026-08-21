namespace GuessTheNumber.Domain;

public enum GameRoundStatus
{
    InProgress,
    Won
}

public class GameRound
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int SecretNumber { get; set; }
    public int MinRange { get; set; } = 1;
    public int MaxRange { get; set; } = 43;
    public int GuessCount { get; set; }
    public GameRoundStatus Status { get; set; } = GameRoundStatus.InProgress;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
