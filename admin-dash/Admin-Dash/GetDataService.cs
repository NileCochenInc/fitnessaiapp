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

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<int> GetUserCountAsync()
    {
        return await _dbContext.Users.CountAsync();
    }

    // Workout queries
    public async Task<List<Workout>> GetAllWorkoutsAsync()
    {
        return await _dbContext.Workouts.ToListAsync();
    }

    public async Task<Workout?> GetWorkoutByIdAsync(int id)
    {
        return await _dbContext.Workouts.FirstOrDefaultAsync(w => w.Id == id);
    }

    // Exercise queries
    public async Task<List<Exercise>> GetAllExercisesAsync()
    {
        return await _dbContext.Exercises.ToListAsync();
    }

    public async Task<Exercise?> GetExerciseByIdAsync(int id)
    {
        return await _dbContext.Exercises.FirstOrDefaultAsync(e => e.Id == id);
    }

    // Entry queries
    public async Task<List<Entry>> GetAllEntriesAsync()
    {
        return await _dbContext.Entries.ToListAsync();
    }

    public async Task<Entry?> GetEntryByIdAsync(int id)
    {
        return await _dbContext.Entries.FirstOrDefaultAsync(e => e.Id == id);
    }
}
