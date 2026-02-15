using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class WorkoutExercise
{
    public long Id { get; set; }

    public long ExerciseId { get; set; }

    public long WorkoutId { get; set; }

    public string? Note { get; set; }

    public string? ExerciseText { get; set; }

    public virtual ICollection<Entry> Entries { get; set; } = new List<Entry>();

    public virtual Exercise Exercise { get; set; } = null!;

    public virtual Workout Workout { get; set; } = null!;
}
