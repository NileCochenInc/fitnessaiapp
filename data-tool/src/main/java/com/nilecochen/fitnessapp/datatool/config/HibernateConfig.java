package com.nilecochen.fitnessapp.datatool.config;

import org.hibernate.SessionFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.persistence.EntityManagerFactory;

@Configuration
public class HibernateConfig {

    @Bean
    @ConditionalOnBean(EntityManagerFactory.class)
    public SessionFactory sessionFactory(EntityManagerFactory entityManagerFactory) {
        return entityManagerFactory.unwrap(SessionFactory.class);
    }
}
