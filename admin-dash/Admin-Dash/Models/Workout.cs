using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class Workout
{
    public long Id { get; set; }

    public DateOnly WorkoutDate { get; set; }

    public long UserId { get; set; }

    public string? WorkoutKind { get; set; }

    public string? WorkoutText { get; set; }

    public string? Workouttext { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<WorkoutExercise> WorkoutExercises { get; set; } = new List<WorkoutExercise>();
}
