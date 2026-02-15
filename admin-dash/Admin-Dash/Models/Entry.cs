using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class Entry
{
    public long Id { get; set; }

    public long WorkoutExerciseId { get; set; }

    public long EntryIndex { get; set; }

    public virtual ICollection<EntryMetric> EntryMetrics { get; set; } = new List<EntryMetric>();

    public virtual WorkoutExercise WorkoutExercise { get; set; } = null!;
}
