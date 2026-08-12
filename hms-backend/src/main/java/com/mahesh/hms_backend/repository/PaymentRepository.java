package com.mahesh.hms_backend.repository;

import com.mahesh.hms_backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByPatientName(String patientName);

    Optional<Payment> findByAppointmentId(Long appointmentId);
}