using Admin_Dash.Models;
using Microsoft.EntityFrameworkCore;

namespace Admin_Dash;

public class GetDataService
{
    private readonly AppDbContext _dbContext;

    public GetDataService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // User queries
    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _dbContext.Users.ToListAsync();
    }

    public async Task<int> GetTotalUsersAsync()
    {
        return await _dbContext.Users.CountAsync();
    }

    // Workout queries
    public async Task<List<WorkoutCountDto>> GetWorkoutCountByDateAsync()
    {
        var result = await _dbContext.Workouts
            .GroupBy(w => w.WorkoutDate)
            .Select(g => new WorkoutCountDto { Date = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Date)
            .ToListAsync();
        
        return result;
    }

    public async Task<List<WorkoutByDayOfWeekDto>> GetWorkoutsByDayOfWeekAsync(int days = 30)
    {
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
        
        var workouts = await _dbContext.Workouts
            .Where(w => w.WorkoutDate >= startDate)
            .Select(w => new { w.WorkoutDate })
            .ToListAsync();
        
        var totalCount = workouts.Count;
        
        if (totalCount == 0)
        {
            var daysOfWeek = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
            return daysOfWeek
                .Select(day => new WorkoutByDayOfWeekDto { DayOfWeek = day, Count = 0, Percentage = 0 })
                .ToList();
        }
        
        var workoutsByDay = workouts
            .GroupBy(w => w.WorkoutDate.DayOfWeek)
            .ToDictionary(g => g.Key, g => g.Count());
        
        // Order Monday through Sunday
        var orderedDays = new DayOfWeek[] { DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday };
        
        var result = orderedDays
            .Select(day => new WorkoutByDayOfWeekDto
            {
                DayOfWeek = day.ToString(),
                Count = workoutsByDay.ContainsKey(day) ? workoutsByDay[day] : 0,
                Percentage = workoutsByDay.ContainsKey(day) ? (decimal)workoutsByDay[day] / totalCount * 100 : 0
            })
            .ToList();
        
        return result;
    }

    // Exercise queries
    public async Task<List<ExerciseCountDto>> GetTopExercisesByDateAsync(int days = 30, int topCount = 20)
    {
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
        
        var result = await _dbContext.WorkoutExercises
            .Where(we => we.Workout.WorkoutDate >= startDate)
            .GroupBy(we => we.Exercise.Name)
            .Select(g => new ExerciseCountDto 
            { 
                ExerciseName = g.Key, 
                Count = g.Count() 
            })
            .OrderByDescending(x => x.Count)
            .Take(topCount)
            .ToListAsync();
        
        return result;
    }

    // Metrics queries
    public async Task<List<MetricCountDto>> GetTopMetricsByDateAsync(int days = 30, int topCount = 6)
    {
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
        
        var result = await _dbContext.EntryMetrics
            .Where(em => em.Entry.WorkoutExercise.Workout.WorkoutDate >= startDate)
            .GroupBy(em => em.Metric.DisplayName ?? em.Metric.Key)
            .Select(g => new MetricCountDto 
            { 
                MetricName = g.Key, 
                Count = g.Count() 
            })
            .OrderByDescending(x => x.Count)
            .Take(topCount)
            .ToListAsync();
        
        return result;
    }

}
