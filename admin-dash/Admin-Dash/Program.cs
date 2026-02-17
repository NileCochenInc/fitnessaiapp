using Admin_Dash;
using Admin_Dash.Models;
using Admin_Dash.Middleware;

var builder = WebApplication.CreateBuilder(args);

Data.ConfigureDatabase(builder);
builder.Services.AddScoped<GetDataService>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolver = AppJsonSerializerContext.Default;
});

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseAdminTokenAuth();
app.MapOpenApi();

using var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await Data.TestDatabaseConnectionAsync(dbContext);
var getDataService = scope.ServiceProvider.GetRequiredService<GetDataService>();

app.MapGet("/weekday_workout_frequency", async () =>
    await getDataService.GetWorkoutsByDayOfWeekAsync())
    .WithWorkoutFrequencyOpenApi();

app.MapGet("/total_users", async () =>
    new TotalUsersResponse { TotalUsers = await getDataService.GetTotalUsersAsync() })
    .WithTotalUsersOpenApi();

app.MapGet("/popular_metrics", async () =>
    await getDataService.GetTopMetricsByDateAsync())
    .WithPopularMetricsOpenApi();

app.MapGet("/popular_exercises", async () =>
    await getDataService.GetTopExercisesByDateAsync())
    .WithPopularExercisesOpenApi();

app.MapGet("/workouts_by_date", async () =>
    await getDataService.GetWorkoutCountByDateAsync())
    .WithWorkoutsByDateOpenApi();

app.MapGet("/health", () =>
    new HealthResponse { Status = "healthy", Timestamp = DateTime.UtcNow })
    .WithHealthOpenApi();

app.Run();
