package com.nilecochen.fitnessapp.datatool.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "metric_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetricDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String key;

    @Column(name = "is_global", nullable = false)
    private Boolean isGlobal;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "value_type")
    private String valueType;

    @Column(name = "default_unit")
    private String defaultUnit;

    // Relationships
    @OneToMany(mappedBy = "metricDefinition", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EntryMetric> entryMetrics = new HashSet<>();

    @ManyToMany(mappedBy = "metricDefinitions")
    private Set<Exercise> exercises = new HashSet<>();
}
