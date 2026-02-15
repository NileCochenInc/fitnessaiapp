using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class MetricExerciseJunction
{
    public long Id { get; set; }

    public long MetricId { get; set; }

    public long ExerciseId { get; set; }

    public virtual Exercise Exercise { get; set; } = null!;

    public virtual MetricDefinition Metric { get; set; } = null!;
}
