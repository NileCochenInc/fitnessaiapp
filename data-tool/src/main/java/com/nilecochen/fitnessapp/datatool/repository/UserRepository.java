package com.nilecochen.fitnessapp.datatool.repository;

import com.nilecochen.fitnessapp.datatool.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by ID
    // (inherited from JpaRepository)
}
