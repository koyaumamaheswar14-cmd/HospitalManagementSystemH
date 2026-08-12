package com.mahesh.hms_backend.contollers;

import com.mahesh.hms_backend.entity.Doctor;
import com.mahesh.hms_backend.entity.User;
import com.mahesh.hms_backend.repository.DoctorRepository;
import com.mahesh.hms_backend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorController(
            DoctorRepository doctorRepository,
            UserRepository userRepository) {

        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Doctor> getAllDoctors() {

        List<Doctor> doctors = doctorRepository.findAll();

        for (Doctor doctor : doctors) {

            User user = userRepository.findById(
                    doctor.getUserId()
            ).orElse(null);

            if (user != null) {
                doctor.setUsername(user.getUsername());
                doctor.setFullName(user.getFullName());
            }
        }

        return doctors;
    }
}