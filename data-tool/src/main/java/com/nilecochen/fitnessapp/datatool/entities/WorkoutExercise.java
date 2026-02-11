package com.nilecochen.fitnessapp.datatool.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "workout_exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(columnDefinition = "vector(1024)")
    private String embeddings;

    @Column(name = "exercise_text", columnDefinition = "TEXT")
    private String exerciseText;

    // Relationships
    @OneToMany(mappedBy = "workoutExercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Entry> entries = new HashSet<>();
}
