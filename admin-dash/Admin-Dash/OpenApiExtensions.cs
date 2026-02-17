using Admin_Dash.Models;
using Microsoft.AspNetCore.Builder;

namespace Admin_Dash;

public static class OpenApiExtensions
{
    public static RouteHandlerBuilder WithWorkoutFrequencyOpenApi(this RouteHandlerBuilder builder)
    {
        return builder
            .WithName("GetWeekdayWorkoutFrequency")
            .WithOpenApi()
            .WithDescription("Returns workout frequency by day of week for the last 30 days")
            .WithSummary("Weekday Workout Frequency")
            .Produces<List<WorkoutByDayOfWeekDto>>(StatusCodes.Status200OK);
    }

    public static RouteHandlerBuilder WithTotalUsersOpenApi(this RouteHandlerBuilder builder)
    {
        return builder
            .WithName("GetTotalUsers")
            .WithOpenApi()
            .WithDescription("Returns the total number of users in the system")
            .WithSummary("Total Users Count")
            .Produces<TotalUsersResponse>(StatusCodes.Status200OK);
    }

    public static RouteHandlerBuilder WithPopularMetricsOpenApi(this RouteHandlerBuilder builder)
    {
        return builder
            .WithName("GetPopularMetrics")
            .WithOpenApi()
            .WithDescription("Returns the top 6 most popular metrics from the last 30 days")
            .WithSummary("Top Popular Metrics")
            .Produces<List<MetricCountDto>>(StatusCodes.Status200OK);
    }

    public static RouteHandlerBuilder WithPopularExercisesOpenApi(this RouteHandlerBuilder builder)
    {
        return builder
            .WithName("GetPopularExercises")
            .WithOpenApi()
            .WithDescription("Returns the top 20 most popular exercises from the last 30 days")
            .WithSummary("Top Popular Exercises")
            .Produces<List<ExerciseCountDto>>(StatusCodes.Status200OK);
    }

    public static RouteHandlerBuilder WithWorkoutsByDateOpenApi(this RouteHandlerBuilder builder)
    {
        return builder
            .WithName("GetWorkoutsByDate")
            .WithOpenApi()
            .WithDescription("Returns workout count grouped by date, ordered by most recent")
            .WithSummary("Workouts by Date")
            .Produces<List<WorkoutCountDto>>(StatusCodes.Status200OK);
    }

    public static RouteHandlerBuilder WithHealthOpenApi(this RouteHandlerBuilder builder)
    {
        return builder
            .WithName("GetHealth")
            .WithOpenApi()
            .WithDescription("Health check endpoint to verify service is running")
            .WithSummary("Health Status")
            .Produces<HealthResponse>(StatusCodes.Status200OK)
            .ExcludeFromDescription();
    }
}
