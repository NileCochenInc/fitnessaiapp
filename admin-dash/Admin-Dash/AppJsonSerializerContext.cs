using System.Text.Json.Serialization;
using Admin_Dash.Models;

namespace Admin_Dash;

[JsonSerializable(typeof(TotalUsersResponse))]
[JsonSerializable(typeof(List<WorkoutCountDto>))]
[JsonSerializable(typeof(WorkoutCountDto))]
[JsonSerializable(typeof(List<ExerciseCountDto>))]
[JsonSerializable(typeof(ExerciseCountDto))]
[JsonSerializable(typeof(List<MetricCountDto>))]
[JsonSerializable(typeof(MetricCountDto))]
[JsonSerializable(typeof(HealthResponse))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}

public class TotalUsersResponse
{
    public int TotalUsers { get; set; }
}

public class HealthResponse
{
    public string Status { get; set; }
    public DateTime Timestamp { get; set; }
}
