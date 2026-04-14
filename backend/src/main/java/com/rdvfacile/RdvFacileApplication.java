package com.rdvfacile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RdvFacileApplication {
    public static void main(String[] args) {
        SpringApplication.run(RdvFacileApplication.class, args);
    }
}
