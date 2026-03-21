package com.nilecochen.fitnessapp.datatool.controller;

import com.nilecochen.fitnessapp.datatool.repository.DataBaseCollectionRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home")
public class HomeController {
    public HomeController(DataBaseCollectionRepository dataBaseCollectionRepository) {
        this.dataBaseCollectionRepository = dataBaseCollectionRepository;
    }

    @GetMapping("")
    public String index() {
        return "hello";
    }

    @GetMapping("{id}")
    public String getInfo() {
        return dataBaseCollectionRepository.getInfo();
    }

    private final DataBaseCollectionRepository dataBaseCollectionRepository;

}
