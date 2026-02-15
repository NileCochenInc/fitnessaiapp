using Admin_Dash;
using Admin_Dash.Models;

var builder = WebApplication.CreateBuilder(args);

Data.ConfigureDatabase(builder);
builder.Services.AddScoped<GetDataService>();

var app = builder.Build();

// Test database connection
using var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await Data.TestDatabaseConnectionAsync(dbContext);

//app.MapGet("/", () => "Hello World!");

//app.Run();