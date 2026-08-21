using GuessTheNumber.Api.Contracts;
using GuessTheNumber.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        app.MapGet("/api/users/me", async (HttpContext http, AppDbContext db) =>
        {
            var uid = http.User.FindFirst("sub")?.Value;
            if (uid is null)
            {
                return Results.Unauthorized();
            }

            var user = await db.Users.SingleOrDefaultAsync(u => u.FirebaseUid == uid);
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
