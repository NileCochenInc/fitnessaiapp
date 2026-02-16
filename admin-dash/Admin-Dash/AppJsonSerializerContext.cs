using System.Text.Json.Serialization;
using Admin_Dash.Models;

namespace Admin_Dash;

[JsonSerializable(typeof(List<WorkoutCountDto>))]
[JsonSerializable(typeof(WorkoutCountDto))]
[JsonSerializable(typeof(List<ExerciseCountDto>))]
[JsonSerializable(typeof(ExerciseCountDto))]
[JsonSerializable(typeof(HealthResponse))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}

public class HealthResponse
{
    public string Status { get; set; }
    public DateTime Timestamp { get; set; }
}
