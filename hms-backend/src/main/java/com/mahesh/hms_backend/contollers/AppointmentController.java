package com.mahesh.hms_backend.contollers;

import com.mahesh.hms_backend.entity.Appointment;
import com.mahesh.hms_backend.entity.AppointmentStatusHistory;
import com.mahesh.hms_backend.entity.User;
import com.mahesh.hms_backend.entity.Payment;

import com.mahesh.hms_backend.repository.AppointmentRepository;
import com.mahesh.hms_backend.repository.AppointmentStatusHistoryRepository;
import com.mahesh.hms_backend.repository.UserRepository;
import com.mahesh.hms_backend.repository.PaymentRepository;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentRepository repo;
    private final UserRepository userRepository;
    private final AppointmentStatusHistoryRepository historyRepository;
    private final PaymentRepository paymentRepository;

    public AppointmentController(
            AppointmentRepository repo,
            UserRepository userRepository,
            AppointmentStatusHistoryRepository historyRepository,
            PaymentRepository paymentRepository) {

        this.repo = repo;
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
        this.paymentRepository = paymentRepository;
    }

    // =========================
    // GET ALL APPOINTMENTS
    // =========================

    @GetMapping
    public List<Appointment> getAll() {
        return repo.findAll();
    }

    // =========================
    // CREATE APPOINTMENT
    // =========================

    @PostMapping
    public Appointment create(
            @RequestBody Appointment appointment) {

        // New appointment starts as Scheduled
        appointment.setStatus("Scheduled");

        // Save appointment first
        // This generates the appointment ID
        Appointment savedAppointment = repo.save(appointment);

        // =========================
        // CREATE PAYMENT AUTOMATICALLY
        // =========================

        Payment payment = new Payment();

        payment.setAppointmentId(savedAppointment.getId());
        payment.setPatientName(
                savedAppointment.getPatientName()
        );
        payment.setDoctorName(
                savedAppointment.getDoctorName()
        );

        // Default consultation fee
        payment.setAmount(500.0);

        // Default payment method for now
        payment.setPaymentMethod("UPI");

        // IMPORTANT:
        // Patient must pay before doctor can confirm
        payment.setStatus("Pending");

        paymentRepository.save(payment);

        // =========================
        // TRACKING HISTORY
        // =========================

        saveHistory(
                savedAppointment.getId(),
                "Scheduled",
                "Hospital"
        );

        return savedAppointment;
    }

    // =========================
    // GET DOCTOR APPOINTMENTS
    // =========================

    @GetMapping("/doctor/{doctorName}")
    public List<Appointment> getDoctorAppointments(
            @PathVariable String doctorName) {

        return repo.findByDoctorName(doctorName);
    }

    // =========================
    // GET ALL DOCTORS
    // =========================

    @GetMapping("/doctors")
    public List<User> getDoctors() {

        return userRepository.findByRole("doctor");
    }

    // =========================
    // GET PATIENT APPOINTMENTS
    // =========================

    @GetMapping("/patient/{patientName}")
    public List<Appointment> getPatientAppointments(
            @PathVariable String patientName) {

        return repo.findByPatientName(patientName);
    }

    // =========================
    // TRACK APPOINTMENT
    // =========================

    @GetMapping("/{id}/tracking")
    public Map<String, Object> trackAppointment(
            @PathVariable Long id) {

        Appointment appointment =
                repo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"));

        List<AppointmentStatusHistory> history =
                historyRepository
                        .findByAppointmentIdOrderByUpdatedAtAsc(id);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "appointmentId",
                appointment.getId()
        );

        response.put(
                "patientName",
                appointment.getPatientName()
        );

        response.put(
                "doctorName",
                appointment.getDoctorName()
        );

        response.put(
                "appointmentTime",
                appointment.getAppointmentTime()
        );

        response.put(
                "currentStatus",
                appointment.getStatus()
        );

        response.put(
                "timeline",
                history
        );

        return response;
    }

    // =========================
    // UPDATE STATUS
    // =========================

    @PutMapping("/{id}/status")
    public Appointment updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String location) {

        Appointment appointment =
                repo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"));

        String currentStatus =
                appointment.getStatus();

        // =========================
        // COMPLETED CANNOT CHANGE
        // =========================

        if ("Completed".equalsIgnoreCase(currentStatus)) {

            throw new RuntimeException(
                    "Appointment is already Completed"
            );
        }

        // =========================
        // CANCELLED CANNOT CHANGE
        // =========================

        if ("Cancelled".equalsIgnoreCase(currentStatus)) {

            throw new RuntimeException(
                    "Appointment is already Cancelled"
            );
        }

        // =========================
        // PAYMENT CHECK
        // Scheduled -> Confirmed
        // =========================

        if ("Confirmed".equalsIgnoreCase(status)
                && "Scheduled".equalsIgnoreCase(currentStatus)) {

            Optional<Payment> payment =
                    paymentRepository
                            .findByAppointmentId(id);

            // Payment does not exist
            if (payment.isEmpty()) {

                throw new RuntimeException(
                        "Payment is required before confirming the appointment"
                );
            }

            // Payment exists but is not paid
            if (!"Paid".equalsIgnoreCase(
                    payment.get().getStatus())) {

                throw new RuntimeException(
                        "Payment is pending. Patient must complete payment before confirmation"
                );
            }
        }

        // =========================
        // VALIDATE STATUS FLOW
        // =========================

        if (!isValidTransition(
                currentStatus,
                status)) {

            throw new RuntimeException(
                    "Invalid status transition: "
                            + currentStatus
                            + " -> "
                            + status
            );
        }

        appointment.setStatus(status);

        Appointment savedAppointment =
                repo.save(appointment);

        // =========================
        // LOCATION
        // =========================

        if (location == null ||
                location.isBlank()) {

            location =
                    getLocationForStatus(status);
        }

        // =========================
        // TRACKING HISTORY
        // =========================

        saveHistory(
                id,
                status,
                location
        );

        return savedAppointment;
    }

    // =========================
    // CANCEL APPOINTMENT
    // =========================

    @PutMapping("/{id}/cancel")
    public Appointment cancelAppointment(
            @PathVariable Long id) {

        Appointment appointment =
                repo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"));

        String currentStatus =
                appointment.getStatus();

        // Only Scheduled and Confirmed
        // appointments can be cancelled

        if (!"Scheduled".equalsIgnoreCase(currentStatus)
                && !"Confirmed".equalsIgnoreCase(currentStatus)) {

            throw new RuntimeException(
                    "Appointment cannot be cancelled when status is "
                            + currentStatus
            );
        }

        appointment.setStatus("Cancelled");

        Appointment savedAppointment =
                repo.save(appointment);

        saveHistory(
                id,
                "Cancelled",
                "Hospital"
        );

        return savedAppointment;
    }

    // =========================
    // CHANGE DOCTOR
    // =========================

    @PutMapping("/{id}/change-doctor")
    public Appointment changeDoctor(
            @PathVariable Long id,
            @RequestParam String doctorName) {

        Appointment appointment =
                repo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found"));

        String currentStatus =
                appointment.getStatus();

        // Doctor can only be changed
        // while appointment is Scheduled

        if (!"Scheduled".equalsIgnoreCase(
                currentStatus)) {

            throw new RuntimeException(
                    "Doctor can only be changed when appointment is Scheduled"
            );
        }

        if (doctorName == null ||
                doctorName.isBlank()) {

            throw new RuntimeException(
                    "Doctor name is required"
            );
        }

        // =========================
        // CHECK DOCTOR
        // =========================

        List<User> doctors =
                userRepository.findByRole("doctor");

        boolean doctorExists =
                doctors.stream()
                        .anyMatch(doctor ->
                                doctor.getUsername()
                                        .equalsIgnoreCase(
                                                doctorName));

        if (!doctorExists) {

            throw new RuntimeException(
                    "Doctor not found: "
                            + doctorName
            );
        }

        // =========================
        // SAME DOCTOR CHECK
        // =========================

        if (appointment.getDoctorName() != null
                && appointment.getDoctorName()
                        .equalsIgnoreCase(doctorName)) {

            throw new RuntimeException(
                    "Appointment is already assigned to this doctor"
            );
        }

        // =========================
        // CHANGE DOCTOR
        // =========================

        appointment.setDoctorName(doctorName);

        Appointment savedAppointment =
                repo.save(appointment);

        // Tracking
        saveHistory(
                id,
                "Doctor Changed",
                "Hospital"
        );

        saveHistory(
                id,
                "Scheduled",
                "Hospital"
        );

        return savedAppointment;
    }

    // =========================
    // VALID STATUS TRANSITION
    // =========================

    private boolean isValidTransition(
            String currentStatus,
            String newStatus) {

        if (currentStatus == null ||
                newStatus == null) {

            return false;
        }

        // Scheduled -> Confirmed

        if ("Scheduled".equalsIgnoreCase(
                currentStatus)) {

            return "Confirmed".equalsIgnoreCase(
                    newStatus);
        }

        // Confirmed -> In Progress

        if ("Confirmed".equalsIgnoreCase(
                currentStatus)) {

            return "In Progress".equalsIgnoreCase(
                    newStatus);
        }

        // In Progress -> Completed

        if ("In Progress".equalsIgnoreCase(
                currentStatus)) {

            return "Completed".equalsIgnoreCase(
                    newStatus);
        }

        return false;
    }

    // =========================
    // LOCATION
    // =========================

    private String getLocationForStatus(
            String status) {

        if ("Scheduled".equalsIgnoreCase(status)) {
            return "Hospital";
        }

        if ("Confirmed".equalsIgnoreCase(status)) {
            return "Doctor's Office";
        }

        if ("In Progress".equalsIgnoreCase(status)) {
            return "Consultation Room";
        }

        if ("Completed".equalsIgnoreCase(status)) {
            return "Hospital";
        }

        if ("Cancelled".equalsIgnoreCase(status)) {
            return "Hospital";
        }

        return "Hospital";
    }

    // =========================
    // SAVE TRACKING HISTORY
    // =========================

    private void saveHistory(
            Long appointmentId,
            String status,
            String location) {

        AppointmentStatusHistory history =
                new AppointmentStatusHistory();

        history.setAppointmentId(
                appointmentId
        );

        history.setStatus(status);

        history.setLocation(location);

        history.setUpdatedAt(
                LocalDateTime.now()
        );

        historyRepository.save(history);
    }
}