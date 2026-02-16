namespace Admin_Dash.Models;

public class WorkoutByDayOfWeekDto
{
    public string DayOfWeek { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}
