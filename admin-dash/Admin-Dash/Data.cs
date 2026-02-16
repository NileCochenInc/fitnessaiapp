using System;
using Microsoft.EntityFrameworkCore;
using Admin_Dash.Models;

namespace Admin_Dash;


public static class Data
{
    public static string GetConnectionString()
    {
        var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
        var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5433";
        var user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
        var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
        var database = Environment.GetEnvironmentVariable("POSTGRES_DB");

        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(database))
        {
            throw new InvalidOperationException("Missing required environment variables: POSTGRES_PASSWORD or POSTGRES_DB");
        }

        return $"Host={host};Port={port};Database={database};Username={user};Password={password}";
    }

    public static void ConfigureDatabase(WebApplicationBuilder builder)
    {
        var connectionString = GetConnectionString();
        builder.Services.AddNpgsql<AppDbContext>(connectionString);
    }

    public static async Task TestDatabaseConnectionAsync(AppDbContext dbContext)
    {
        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync();
            if (canConnect)
            {
                Console.WriteLine("✓ Database connection successful!");
                var userCount = await dbContext.Users.CountAsync();
                Console.WriteLine($"✓ Found {userCount} users in database");
            }
            else
            {
                Console.WriteLine("✗ Database connection failed!");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"✗ Database connection failed: {ex.Message}");
        }
    }
}