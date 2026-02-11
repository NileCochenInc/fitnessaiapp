package com.nilecochen.fitnessapp.datatool.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "entry_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntryMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    private Entry entry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metric_id", nullable = false)
    private MetricDefinition metricDefinition;

    @Column(name = "value_number")
    private Double valueNumber;

    @Column(name = "value_text", columnDefinition = "TEXT")
    private String valueText;

    private String unit;
}
