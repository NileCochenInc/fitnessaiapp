package com.nilecochen.fitnessapp.datatool.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_global", nullable = false)
    private Boolean isGlobal;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Relationships
    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkoutExercise> workoutExercises = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "metric_exercise_junction",
        joinColumns = @JoinColumn(name = "exercise_id"),
        inverseJoinColumns = @JoinColumn(name = "metric_id")
    )
    private Set<MetricDefinition> metricDefinitions = new HashSet<>();
}
