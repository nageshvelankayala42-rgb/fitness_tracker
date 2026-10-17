package com.fitness.fitnessbackend.dto;

import com.fitness.fitnessbackend.entity.User;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Integer age;
    private String gender;
    private Double weight;
    private Double height;
    private String fitnessGoal;
    private String activityLevel;
    private String preferredWorkoutType;

    public UserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.age = user.getAge();
        this.gender = user.getGender();
        this.weight = user.getWeight();
        this.height = user.getHeight();
        this.fitnessGoal = user.getFitnessGoal();
        this.activityLevel = user.getActivityLevel();
        this.preferredWorkoutType = user.getPreferredWorkoutType();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public Integer getAge() { return age; }
    public String getGender() { return gender; }
    public Double getWeight() { return weight; }
    public Double getHeight() { return height; }
    public String getFitnessGoal() { return fitnessGoal; }
    public String getActivityLevel() { return activityLevel; }
    public String getPreferredWorkoutType() { return preferredWorkoutType; }
}