using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Admin_Dash.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Entry> Entries { get; set; }

    public virtual DbSet<EntryMetric> EntryMetrics { get; set; }

    public virtual DbSet<Exercise> Exercises { get; set; }

    public virtual DbSet<MetricDefinition> MetricDefinitions { get; set; }

    public virtual DbSet<MetricExerciseJunction> MetricExerciseJunctions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Workout> Workouts { get; set; }

    public virtual DbSet<WorkoutExercise> WorkoutExercises { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");

        modelBuilder.Entity<Entry>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("entries_pkey");

            entity.ToTable("entries");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EntryIndex).HasColumnName("entry_index");
            entity.Property(e => e.WorkoutExerciseId).HasColumnName("workout_exercise_id");

            entity.HasOne(d => d.WorkoutExercise).WithMany(p => p.Entries)
                .HasForeignKey(d => d.WorkoutExerciseId)
                .HasConstraintName("fk_entries_workout_exercise");
        });

        modelBuilder.Entity<EntryMetric>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("entry_metrics_pkey");

            entity.ToTable("entry_metrics");

            entity.HasIndex(e => new { e.EntryId, e.MetricId }, "entry_metrics_definitions_uniq").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.EntryId).HasColumnName("entry_id");
            entity.Property(e => e.MetricId).HasColumnName("metric_id");
            entity.Property(e => e.Unit)
                .HasMaxLength(50)
                .HasColumnName("unit");
            entity.Property(e => e.ValueNumber).HasColumnName("value_number");
            entity.Property(e => e.ValueText).HasColumnName("value_text");

            entity.HasOne(d => d.Entry).WithMany(p => p.EntryMetrics)
                .HasForeignKey(d => d.EntryId)
                .HasConstraintName("fk_entry_metrics_entry");

            entity.HasOne(d => d.Metric).WithMany(p => p.EntryMetrics)
                .HasForeignKey(d => d.MetricId)
                .HasConstraintName("fk_entry_metrics_metric");
        });

        modelBuilder.Entity<Exercise>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("exercises_pkey");

            entity.ToTable("exercises");

            entity.HasIndex(e => new { e.Name, e.IsGlobal }, "uniq_global_name").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsGlobal).HasColumnName("is_global");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Exercises)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_exercises_user");
        });

        modelBuilder.Entity<MetricDefinition>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("metric_definitions_pkey");

            entity.ToTable("metric_definitions");

            entity.HasIndex(e => new { e.Key, e.IsGlobal }, "uniq_global_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DefaultUnit)
                .HasMaxLength(50)
                .HasColumnName("default_unit");
            entity.Property(e => e.DisplayName)
                .HasMaxLength(255)
                .HasColumnName("display_name");
            entity.Property(e => e.IsGlobal).HasColumnName("is_global");
            entity.Property(e => e.Key)
                .HasMaxLength(100)
                .HasColumnName("key");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.ValueType)
                .HasMaxLength(20)
                .HasColumnName("value_type");

            entity.HasOne(d => d.User).WithMany(p => p.MetricDefinitions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_user_metric_definitions_user");
        });

        modelBuilder.Entity<MetricExerciseJunction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("metric_exercise_junction_pkey");

            entity.ToTable("metric_exercise_junction");

            entity.HasIndex(e => new { e.MetricId, e.ExerciseId }, "uniq_metric_exercise").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ExerciseId).HasColumnName("exercise_id");
            entity.Property(e => e.MetricId).HasColumnName("metric_id");

            entity.HasOne(d => d.Exercise).WithMany(p => p.MetricExerciseJunctions)
                .HasForeignKey(d => d.ExerciseId)
                .HasConstraintName("fk_junction_exercise");

            entity.HasOne(d => d.Metric).WithMany(p => p.MetricExerciseJunctions)
                .HasForeignKey(d => d.MetricId)
                .HasConstraintName("fk_junction_metric");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.GoogleId, "users_google_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.Goal).HasColumnName("goal");
            entity.Property(e => e.GoogleId)
                .HasMaxLength(255)
                .HasColumnName("google_id");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Provider)
                .HasMaxLength(50)
                .HasColumnName("provider");
            entity.Property(e => e.Username)
                .HasMaxLength(255)
                .HasColumnName("username");
        });

        modelBuilder.Entity<Workout>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("workouts_pkey");

            entity.ToTable("workouts");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.WorkoutDate).HasColumnName("workout_date");
            entity.Property(e => e.WorkoutKind)
                .HasMaxLength(50)
                .HasColumnName("workout_kind");
            entity.Property(e => e.WorkoutText).HasColumnName("workout_text");
            entity.Property(e => e.Workouttext).HasColumnName("workouttext");

            entity.HasOne(d => d.User).WithMany(p => p.Workouts)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_workouts_user");
        });

        modelBuilder.Entity<WorkoutExercise>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("workout_exercises_pkey");

            entity.ToTable("workout_exercises");

            entity.HasIndex(e => new { e.ExerciseId, e.WorkoutId }, "workout_exercise_unique").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ExerciseId).HasColumnName("exercise_id");
            entity.Property(e => e.ExerciseText).HasColumnName("exercise_text");
            entity.Property(e => e.Note).HasColumnName("note");
            entity.Property(e => e.WorkoutId).HasColumnName("workout_id");

            entity.HasOne(d => d.Exercise).WithMany(p => p.WorkoutExercises)
                .HasForeignKey(d => d.ExerciseId)
                .HasConstraintName("fk_workout_exercises_exercise");

            entity.HasOne(d => d.Workout).WithMany(p => p.WorkoutExercises)
                .HasForeignKey(d => d.WorkoutId)
                .HasConstraintName("fk_workout_exercises_workout");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
