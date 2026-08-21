using GuessTheNumber.Api.Contracts;
using GuessTheNumber.Infrastructure;

namespace GuessTheNumber.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        app.MapGet("/api/users/me", async (HttpContext http, AppDbContext db) =>
        {
            var user = await http.GetCurrentUserAsync(db);
            if (user is null)
            {
                // Client hasn't called /api/auth/sync yet - no profile to show.
                return Results.NotFound();
            }

            return Results.Ok(UserProfileResponse.FromUser(user));
        })
        .RequireAuthorization()
        .WithName("GetCurrentUser");
    }
}
