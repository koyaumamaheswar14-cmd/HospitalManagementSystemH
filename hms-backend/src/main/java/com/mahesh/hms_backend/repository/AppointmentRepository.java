package com.mahesh.hms_backend.repository;

import com.mahesh.hms_backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorName(String doctorName);
    List<Appointment> findByPatientName(String patientName);
}