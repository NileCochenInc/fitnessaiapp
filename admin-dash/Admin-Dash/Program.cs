using Admin_Dash;
using Admin_Dash.Models;
using Admin_Dash.Middleware;

var builder = WebApplication.CreateBuilder(args);

Data.ConfigureDatabase(builder);
builder.Services.AddScoped<GetDataService>();

// Configure JSON serialization for AOT
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolver = AppJsonSerializerContext.Default;
});

var app = builder.Build();

// Add token authentication middleware
app.UseAdminTokenAuth();

// Test database connection
using var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await Data.TestDatabaseConnectionAsync(dbContext);
var getDataService = scope.ServiceProvider.GetRequiredService<GetDataService>();


// test get workouts by date



app.MapGet("/weekday_workout_frequency", async () => {
    return await getDataService.GetWorkoutsByDayOfWeekAsync();
});

app.MapGet("/total_users", async () => {
    var totalUsers = await getDataService.GetTotalUsersAsync();
    return new TotalUsersResponse { TotalUsers = totalUsers };
});

app.MapGet("/popular_metrics", async () => {
    return await getDataService.GetTopMetricsByDateAsync();
});

app.MapGet("/popular_exercises", async () => {
    return await getDataService.GetTopExercisesByDateAsync();
});

app.MapGet("/workouts_by_date", async () => {
    return await getDataService.GetWorkoutCountByDateAsync();
});

app.MapGet("/health", () => new HealthResponse { Status = "healthy", Timestamp = DateTime.UtcNow });

app.Run();
