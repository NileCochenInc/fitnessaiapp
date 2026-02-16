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

}
