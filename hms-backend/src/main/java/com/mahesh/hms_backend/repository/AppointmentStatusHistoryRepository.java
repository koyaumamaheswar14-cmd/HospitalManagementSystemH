package com.mahesh.hms_backend.repository;

import com.mahesh.hms_backend.entity.AppointmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentStatusHistoryRepository
        extends JpaRepository<AppointmentStatusHistory, Long> {

    List<AppointmentStatusHistory>
    findByAppointmentIdOrderByUpdatedAtAsc(Long appointmentId);
}