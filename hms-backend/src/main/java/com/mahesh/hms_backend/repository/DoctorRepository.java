package com.mahesh.hms_backend.repository;

import com.mahesh.hms_backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}