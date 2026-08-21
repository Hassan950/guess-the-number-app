using GuessTheNumber.Domain;

namespace GuessTheNumber.Api.Contracts;

public record UserProfileResponse(int Id, string Email, string? DisplayName, int? BestGuessCount)
{
    public static UserProfileResponse FromUser(User user) =>
        new(user.Id, user.Email, user.DisplayName, user.BestGuessCount);
}
