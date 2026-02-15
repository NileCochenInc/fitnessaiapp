using System;
using Microsoft.EntityFrameworkCore;
using Admin_Dash.Models;
using DotNetEnv;

namespace Admin_Dash;


public static class Data
{

    public static void LoadEnv()
    {
        // Navigate up to fitness-ai-app root where .env is located
        var repoRoot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..","..");
        var envPath = Path.Combine(repoRoot, ".env");
        
        if (File.Exists(envPath))
        {
            DotNetEnv.Env.Load(envPath);
        }
        else
        {
            throw new FileNotFoundException($".env file not found at {Path.GetFullPath(envPath)}");
        }
    }

    public static string GetConnectionString()
    {
        LoadEnv();
        
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