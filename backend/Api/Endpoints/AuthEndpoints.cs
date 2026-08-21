using GuessTheNumber.Api.Contracts;
using GuessTheNumber.Domain;
using GuessTheNumber.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/sync", async (HttpContext http, AppDbContext db) =>
        {
            var uid = http.User.FindFirst("sub")?.Value;
            var email = http.User.FindFirst("email")?.Value;
            if (uid is null || email is null)
            {
                return Results.Unauthorized();
            }

            var name = http.User.FindFirst("name")?.Value;

            var user = await db.Users.SingleOrDefaultAsync(u => u.FirebaseUid == uid);
            if (user is null)
            {
                user = new User
                {
                    FirebaseUid = uid,
                    Email = email,
                    DisplayName = name,
                    CreatedAt = DateTime.UtcNow
                };
                db.Users.Add(user);
            }
            else
            {
                user.Email = email;
                user.DisplayName = name;
            }

            await db.SaveChangesAsync();

            return Results.Ok(UserProfileResponse.FromUser(user));
        })
        .RequireAuthorization()
        .WithName("SyncUser");
    }
}
