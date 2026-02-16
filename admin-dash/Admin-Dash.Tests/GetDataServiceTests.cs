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

    /// <summary>
    /// Verifies that GetTopExercisesByDateAsync correctly returns the top 20 most performed exercises
    /// from the past 30 days, sorted by count in descending order.
    /// </summary>
    [Fact]
    public async Task GetTopExercisesByDateAsync_WithMultipleExercises_ReturnsTop20ByCount()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        var today = DateOnly.FromDateTime(DateTime.Now);
        var withinRange = today.AddDays(-15);
        var outsideRange = today.AddDays(-31);

        var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", Goal = "Build muscle" };
        context.Users.Add(user);

        // Create exercises
        var squats = new Exercise { Id = 1, Name = "Squats", IsGlobal = true };
        var benchPress = new Exercise { Id = 2, Name = "Bench Press", IsGlobal = true };
        var deadlift = new Exercise { Id = 3, Name = "Deadlift", IsGlobal = true };
        context.Exercises.AddRange(squats, benchPress, deadlift);

        // Create workouts
        var workoutInRange = new Workout { Id = 1, UserId = 1, WorkoutDate = withinRange };
        var workoutOutsideRange = new Workout { Id = 2, UserId = 1, WorkoutDate = outsideRange };
        context.Workouts.AddRange(workoutInRange, workoutOutsideRange);

        // Create workout exercises (Squats: 5, Bench Press: 3, Deadlift: 1, all in range plus outside range)
        context.WorkoutExercises.AddRange(
            new WorkoutExercise { Id = 1, ExerciseId = 1, WorkoutId = 1 }, // Squats in range
            new WorkoutExercise { Id = 2, ExerciseId = 1, WorkoutId = 1 }, // Squats in range
            new WorkoutExercise { Id = 3, ExerciseId = 1, WorkoutId = 1 }, // Squats in range
            new WorkoutExercise { Id = 4, ExerciseId = 1, WorkoutId = 1 }, // Squats in range
            new WorkoutExercise { Id = 5, ExerciseId = 1, WorkoutId = 1 }, // Squats in range
            new WorkoutExercise { Id = 6, ExerciseId = 1, WorkoutId = 2 }, // Squats outside range
            new WorkoutExercise { Id = 7, ExerciseId = 2, WorkoutId = 1 }, // Bench Press in range
            new WorkoutExercise { Id = 8, ExerciseId = 2, WorkoutId = 1 }, // Bench Press in range
            new WorkoutExercise { Id = 9, ExerciseId = 2, WorkoutId = 1 }, // Bench Press in range
            new WorkoutExercise { Id = 10, ExerciseId = 3, WorkoutId = 1 }  // Deadlift in range
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetTopExercisesByDateAsync(days: 30, topCount: 20);

        // Assert
        Assert.NotEmpty(result);
        Assert.Equal(3, result.Count); // Three exercises in range
        Assert.Equal("Squats", result[0].ExerciseName); // Most performed first
        Assert.Equal(5, result[0].Count); // 5 squats in range (6th is outside range)
        Assert.Equal("Bench Press", result[1].ExerciseName);
        Assert.Equal(3, result[1].Count);
        Assert.Equal("Deadlift", result[2].ExerciseName);
        Assert.Equal(1, result[2].Count);
    }

    /// <summary>
    /// Verifies that GetTopExercisesByDateAsync returns an empty list when no workouts exist
    /// within the specified date range.
    /// </summary>
    [Fact]
    public async Task GetTopExercisesByDateAsync_NoExercisesInDateRange_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        var outsideRange = DateOnly.FromDateTime(DateTime.Now.AddDays(-31));

        var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", Goal = "Build muscle" };
        context.Users.Add(user);

        var exercise = new Exercise { Id = 1, Name = "Squats", IsGlobal = true };
        context.Exercises.Add(exercise);

        var workout = new Workout { Id = 1, UserId = 1, WorkoutDate = outsideRange };
        context.Workouts.Add(workout);

        context.WorkoutExercises.Add(
            new WorkoutExercise { Id = 1, ExerciseId = 1, WorkoutId = 1 }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetTopExercisesByDateAsync(days: 30, topCount: 20);

        // Assert
        Assert.Empty(result);
    }

    /// <summary>
    /// Verifies that GetTopMetricsByDateAsync correctly returns the top metrics
    /// from the past 30 days, sorted by count in descending order, and filters out metrics
    /// from workouts outside the date range.
    /// </summary>
    [Fact]
    public async Task GetTopMetricsByDateAsync_WithMultipleMetrics_ReturnsTop20ByCount()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        var today = DateOnly.FromDateTime(DateTime.Now);
        var withinRange = today.AddDays(-15);
        var outsideRange = today.AddDays(-31);

        var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", Goal = "Build muscle" };
        context.Users.Add(user);

        // Create exercises and metrics
        var squats = new Exercise { Id = 1, Name = "Squats", IsGlobal = true };
        context.Exercises.Add(squats);

        var weightMetric = new MetricDefinition { Id = 1, Key = "weight", DisplayName = "Weight (lbs)", IsGlobal = true, ValueType = "number" };
        var repsMetric = new MetricDefinition { Id = 2, Key = "reps", DisplayName = "Reps", IsGlobal = true, ValueType = "number" };
        var noteMetric = new MetricDefinition { Id = 3, Key = "note", DisplayName = "Notes", IsGlobal = true, ValueType = "text" };
        context.MetricDefinitions.AddRange(weightMetric, repsMetric, noteMetric);

        // Create workouts
        var workoutInRange = new Workout { Id = 1, UserId = 1, WorkoutDate = withinRange };
        var workoutOutsideRange = new Workout { Id = 2, UserId = 1, WorkoutDate = outsideRange };
        context.Workouts.AddRange(workoutInRange, workoutOutsideRange);

        // Create workout exercises
        var wexInRange = new WorkoutExercise { Id = 1, ExerciseId = 1, WorkoutId = 1 };
        var wexOutsideRange = new WorkoutExercise { Id = 2, ExerciseId = 1, WorkoutId = 2 };
        context.WorkoutExercises.AddRange(wexInRange, wexOutsideRange);

        // Create entries
        var entry1 = new Entry { Id = 1, WorkoutExerciseId = 1, EntryIndex = 1 };
        var entry2 = new Entry { Id = 2, WorkoutExerciseId = 1, EntryIndex = 2 };
        var entry3 = new Entry { Id = 3, WorkoutExerciseId = 2, EntryIndex = 1 };
        context.Entries.AddRange(entry1, entry2, entry3);

        // Create entry metrics (Weight: 5, Reps: 3, Notes: 1, with one weight outside range)
        context.EntryMetrics.AddRange(
            new EntryMetric { Id = 1, EntryId = 1, MetricId = 1 }, // Weight in range
            new EntryMetric { Id = 2, EntryId = 1, MetricId = 1 }, // Weight in range
            new EntryMetric { Id = 3, EntryId = 1, MetricId = 1 }, // Weight in range
            new EntryMetric { Id = 4, EntryId = 2, MetricId = 1 }, // Weight in range
            new EntryMetric { Id = 5, EntryId = 2, MetricId = 1 }, // Weight in range
            new EntryMetric { Id = 6, EntryId = 3, MetricId = 1 }, // Weight outside range
            new EntryMetric { Id = 7, EntryId = 2, MetricId = 2 }, // Reps in range
            new EntryMetric { Id = 8, EntryId = 2, MetricId = 2 }, // Reps in range
            new EntryMetric { Id = 9, EntryId = 2, MetricId = 2 }, // Reps in range
            new EntryMetric { Id = 10, EntryId = 1, MetricId = 3 }  // Notes in range
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetTopMetricsByDateAsync(days: 30, topCount: 20);

        // Assert
        Assert.NotEmpty(result);
        Assert.Equal(3, result.Count); // Three metrics in range
        Assert.Equal("Weight (lbs)", result[0].MetricName); // Most recorded metric first
        Assert.Equal(5, result[0].Count); // 5 weights in range (6th is outside range)
        Assert.Equal("Reps", result[1].MetricName);
        Assert.Equal(3, result[1].Count);
        Assert.Equal("Notes", result[2].MetricName);
        Assert.Equal(1, result[2].Count);
    }

    /// <summary>
    /// Verifies that GetTopMetricsByDateAsync returns an empty list when no metrics exist
    /// within the specified date range.
    /// </summary>
    [Fact]
    public async Task GetTopMetricsByDateAsync_NoMetricsInDateRange_ReturnsEmptyList()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        var outsideRange = DateOnly.FromDateTime(DateTime.Now.AddDays(-31));

        var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", Goal = "Build muscle" };
        context.Users.Add(user);

        var exercise = new Exercise { Id = 1, Name = "Squats", IsGlobal = true };
        context.Exercises.Add(exercise);

        var metric = new MetricDefinition { Id = 1, Key = "weight", DisplayName = "Weight (lbs)", IsGlobal = true, ValueType = "number" };
        context.MetricDefinitions.Add(metric);

        var workout = new Workout { Id = 1, UserId = 1, WorkoutDate = outsideRange };
        context.Workouts.Add(workout);

        var wex = new WorkoutExercise { Id = 1, ExerciseId = 1, WorkoutId = 1 };
        context.WorkoutExercises.Add(wex);

        var entry = new Entry { Id = 1, WorkoutExerciseId = 1, EntryIndex = 1 };
        context.Entries.Add(entry);

        context.EntryMetrics.Add(
            new EntryMetric { Id = 1, EntryId = 1, MetricId = 1 }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetTopMetricsByDateAsync(days: 30, topCount: 20);

        // Assert
        Assert.Empty(result);
    }

    /// <summary>
    /// Verifies that GetTotalUsersAsync correctly returns the total count of all users
    /// in the database.
    /// </summary>
    [Fact]
    public async Task GetTotalUsersAsync_WithMultipleUsers_ReturnsTotalCount()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        context.Users.AddRange(
            new User { Id = 1, Username = "user1", Email = "user1@example.com", Goal = "Build muscle" },
            new User { Id = 2, Username = "user2", Email = "user2@example.com", Goal = "Lose weight" },
            new User { Id = 3, Username = "user3", Email = "user3@example.com", Goal = "Improve endurance" },
            new User { Id = 4, Username = "user4", Email = "user4@example.com", Goal = "Get stronger" }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetTotalUsersAsync();

        // Assert
        Assert.Equal(4, result);
    }

    /// <summary>
    /// Verifies that GetTotalUsersAsync returns 0 when no users exist in the database.
    /// </summary>
    [Fact]
    public async Task GetTotalUsersAsync_EmptyDatabase_ReturnsZero()
    {
        // Arrange
        using var context = CreateTestDbContext();
        var service = new GetDataService(context);

        // Act
        var result = await service.GetTotalUsersAsync();

        // Assert
        Assert.Equal(0, result);
    }
}
