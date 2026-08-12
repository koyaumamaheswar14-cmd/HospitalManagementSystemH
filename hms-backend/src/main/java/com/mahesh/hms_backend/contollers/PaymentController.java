package com.mahesh.hms_backend.contollers;

import com.mahesh.hms_backend.entity.Appointment;
import com.mahesh.hms_backend.entity.Payment;
import com.mahesh.hms_backend.repository.AppointmentRepository;
import com.mahesh.hms_backend.repository.PaymentRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            AppointmentRepository appointmentRepository) {

        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // =====================================================
    // GET PATIENT PAYMENTS
    // =====================================================

    @GetMapping("/patient/{patientName}")
    public ResponseEntity<List<Payment>> getPatientPayments(
            @PathVariable String patientName) {

        return ResponseEntity.ok(
                paymentRepository.findByPatientName(patientName)
        );
    }

    // =====================================================
    // CREATE PAYMENT
    // =====================================================

    @PostMapping("/create/{appointmentId}")
    public ResponseEntity<?> createPayment(
            @PathVariable Long appointmentId,
            @RequestParam Double amount,
            @RequestParam String paymentMethod) {

        try {

            // Find appointment
            Appointment appointment =
                    appointmentRepository.findById(appointmentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Appointment not found"
                                    )
                            );

            // Prevent duplicate payment
            if (paymentRepository
                    .findByAppointmentId(appointmentId)
                    .isPresent()) {

                return ResponseEntity.badRequest()
                        .body("Payment already exists for this appointment");
            }

            // Validate payment method
            if (!paymentMethod.equalsIgnoreCase("CASH")
                    && !paymentMethod.equalsIgnoreCase("UPI")
                    && !paymentMethod.equalsIgnoreCase("CARD")
                    && !paymentMethod.equalsIgnoreCase("INSURANCE")) {

                return ResponseEntity.badRequest()
                        .body(
                                "Invalid payment method. " +
                                "Use CASH, UPI, CARD or INSURANCE"
                        );
            }

            // Create payment
            Payment payment = new Payment();

            payment.setAppointmentId(appointment.getId());
            payment.setPatientName(appointment.getPatientName());
            payment.setDoctorName(appointment.getDoctorName());
            payment.setAmount(amount);
            payment.setPaymentMethod(
                    paymentMethod.toUpperCase()
            );

            // Payment starts as Pending
            payment.setStatus("Pending");

            Payment savedPayment =
                    paymentRepository.save(payment);

            return ResponseEntity.ok(savedPayment);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // PAY PAYMENT
    // =====================================================

    @PutMapping("/{paymentId}/pay")
    public ResponseEntity<?> payPayment(
            @PathVariable Long paymentId) {

        try {

            // Find payment
            Payment payment =
                    paymentRepository.findById(paymentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Payment not found"
                                    )
                            );

            // Prevent double payment
            if ("Paid".equalsIgnoreCase(payment.getStatus())) {

                return ResponseEntity.badRequest()
                        .body("Payment is already paid");
            }

            // =================================================
            // 1. MARK PAYMENT AS PAID
            // =================================================

            payment.setStatus("Paid");
            payment.setPaidAt(LocalDateTime.now());

            Payment updatedPayment =
                    paymentRepository.save(payment);

            // =================================================
            // 2. FIND RELATED APPOINTMENT
            // =================================================

            Appointment appointment =
                    appointmentRepository.findById(
                            payment.getAppointmentId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Appointment not found"
                            )
                    );

            // =================================================
            // 3. CONFIRM APPOINTMENT
            // =================================================

            appointment.setStatus("Confirmed");

            appointmentRepository.save(appointment);

            // =================================================
            // RESPONSE
            // =================================================

            return ResponseEntity.ok(updatedPayment);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}