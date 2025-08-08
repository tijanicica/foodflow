package com.iis.foodflow.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public String getCustomerData() {
        return "This is a secret message for customers only!";
    }

    @GetMapping("/driver")
    @PreAuthorize("hasRole('DRIVER')")
    public String getDriverData() {
        return "This is for drivers!";
    }
}