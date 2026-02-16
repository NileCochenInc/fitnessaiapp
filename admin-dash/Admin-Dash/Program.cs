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
/*
var workoutsByDate = await getDataService.GetWorkoutCountByDateAsync();
Console.WriteLine("\n=== Workouts by Date ===");
foreach (var item in workoutsByDate)
{
    Console.WriteLine($"{item.Date:yyyy-MM-dd}: {item.Count} workouts");
}
*/


app.MapGet("/workouts_by_date", async () => {
    return await getDataService.GetWorkoutCountByDateAsync();
});

app.MapGet("/health", () => new HealthResponse { Status = "healthy", Timestamp = DateTime.UtcNow });

app.Run();
