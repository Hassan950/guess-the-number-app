using GuessTheNumber.Domain;
using GuessTheNumber.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Api.Endpoints;

public static class CurrentUserExtensions
{
    public static Task<User?> GetCurrentUserAsync(this HttpContext http, AppDbContext db)
    {
        var uid = http.User.FindFirst("sub")?.Value;
        return uid is null
            ? Task.FromResult<User?>(null)
            : db.Users.SingleOrDefaultAsync(u => u.FirebaseUid == uid);
    }
}
