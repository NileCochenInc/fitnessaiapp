using Admin_Dash;
using Admin_Dash.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

public class GetDataServiceTests
{
    private AppDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    /// <summary>
    /// Verifies that GetWorkoutCountByDateAsync correctly groups workouts by date and counts them,
    /// returning results sorted by most recent date first.
    /// </summary>
    [Fact]
    public async Task GetWorkoutCountByDateAsync_WithMultipleWorkouts_ReturnsGroupedByDate()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        var today = DateOnly.FromDateTime(DateTime.Now);
        var yesterday = today.AddDays(-1);
        var twoDaysAgo = today.AddDays(-2);

        // Create test workouts
        var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", Goal = "Build muscle" };
        context.Users.Add(user);

        context.Workouts.AddRange(
            new Workout { Id = 1, UserId = 1, WorkoutDate = today },
            new Workout { Id = 2, UserId = 1, WorkoutDate = today },
            new Workout { Id = 3, UserId = 1, WorkoutDate = yesterday },
            new Workout { Id = 4, UserId = 1, WorkoutDate = twoDaysAgo }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetWorkoutCountByDateAsync();

        // Assert
        Assert.NotEmpty(result);
        Assert.Equal(3, result.Count); // Three different dates
        Assert.Equal(today, result[0].Date); // Most recent first (OrderByDescending)
        Assert.Equal(2, result[0].Count); // Two workouts on today
        Assert.Equal(yesterday, result[1].Date);
        Assert.Equal(1, result[1].Count);
        Assert.Equal(twoDaysAgo, result[2].Date);
        Assert.Equal(1, result[2].Count);
    }

    /// <summary>
    /// Verifies that GetWorkoutCountByDateAsync returns an empty list when no workouts exist.
    /// </summary>
    [Fact]
    public async Task GetWorkoutCountByDateAsync_EmptyDatabase_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        // Act
        var result = await service.GetWorkoutCountByDateAsync();

        // Assert
        Assert.Empty(result);
    }
}
