using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class Exercise
{
    public long Id { get; set; }

    public bool IsGlobal { get; set; }

    public string Name { get; set; } = null!;

    public long? UserId { get; set; }

    public virtual ICollection<MetricExerciseJunction> MetricExerciseJunctions { get; set; } = new List<MetricExerciseJunction>();

    public virtual User? User { get; set; }

    public virtual ICollection<WorkoutExercise> WorkoutExercises { get; set; } = new List<WorkoutExercise>();
}
