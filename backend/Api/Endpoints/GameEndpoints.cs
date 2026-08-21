using GuessTheNumber.Api.Contracts;
using GuessTheNumber.Application;
using GuessTheNumber.Infrastructure;

namespace GuessTheNumber.Api.Endpoints;

public static class GameEndpoints
{
    public static void MapGameEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/game").RequireAuthorization();

        group.MapPost("/start", async (HttpContext http, AppDbContext db, IGameService gameService) =>
        {
            var user = await http.GetCurrentUserAsync(db);
            if (user is null)
            {
                return Results.NotFound("Call /api/auth/sync first.");
            }

            var result = await gameService.StartRoundAsync(user.Id);
            return Results.Ok(result);
        })
        .WithName("StartGame");

        group.MapPost("/guess", async (HttpContext http, AppDbContext db, IGameService gameService, GuessRequest request) =>
        {
            var user = await http.GetCurrentUserAsync(db);
            if (user is null)
            {
                return Results.NotFound("Call /api/auth/sync first.");
            }

            var result = await gameService.SubmitGuessAsync(user.Id, request.RoundId, request.Guess);
            return result is null
                ? Results.NotFound("Round not found, not yours, or already completed.")
                : Results.Ok(result);
        })
        .WithName("SubmitGuess");
    }
}
