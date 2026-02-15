using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class EntryMetric
{
    public long Id { get; set; }

    public long EntryId { get; set; }

    public long MetricId { get; set; }

    public double? ValueNumber { get; set; }

    public string? ValueText { get; set; }

    public string? Unit { get; set; }

    public virtual Entry Entry { get; set; } = null!;

    public virtual MetricDefinition Metric { get; set; } = null!;
}
