using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class MetricDefinition
{
    public long Id { get; set; }

    public long? UserId { get; set; }

    public string Key { get; set; } = null!;

    public bool IsGlobal { get; set; }

    public string? DisplayName { get; set; }

    public string? ValueType { get; set; }

    public string? DefaultUnit { get; set; }

    public virtual ICollection<EntryMetric> EntryMetrics { get; set; } = new List<EntryMetric>();

    public virtual ICollection<MetricExerciseJunction> MetricExerciseJunctions { get; set; } = new List<MetricExerciseJunction>();

    public virtual User? User { get; set; }
}
