using System;
using System.Collections.Generic;

namespace Admin_Dash.Models;

public partial class User
{
    public long Id { get; set; }

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Goal { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string? GoogleId { get; set; }

    public string? Provider { get; set; }

    public virtual ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();

    public virtual ICollection<MetricDefinition> MetricDefinitions { get; set; } = new List<MetricDefinition>();

    public virtual ICollection<Workout> Workouts { get; set; } = new List<Workout>();
}
