package com.nilecochen.fitnessapp.datatool.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;

    @Column(name = "entry_index", nullable = false)
    private Long entryIndex;

    // Relationships
    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EntryMetric> entryMetrics = new HashSet<>();
}
