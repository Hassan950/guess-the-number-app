namespace GuessTheNumber.Domain;

public class User
{
    public int Id { get; set; }
    public required string FirebaseUid { get; set; }
    public required string Email { get; set; }
    public string? DisplayName { get; set; }
    public int? BestGuessCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
