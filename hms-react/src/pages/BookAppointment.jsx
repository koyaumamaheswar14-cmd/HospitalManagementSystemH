import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BookAppointment() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOAD DOCTORS
  // =========================

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/doctors"
      );

      console.log("DOCTOR API STATUS:", response.status);

      if (!response.ok) {
        throw new Error("Failed to load doctors");
      }

      const data = await response.json();

      console.log("DOCTORS FROM BACKEND:", data);

      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        setDoctors([]);
        setError("Invalid doctor data received.");
      }
    } catch (err) {
      console.error("DOCTOR ERROR:", err);
      setError("Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SELECT DOCTOR
  // =========================

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;

    if (!doctorId) {
      setSelectedDoctor(null);
      return;
    }

    const doctor = doctors.find(
      (d) => String(d.id) === String(doctorId)
    );

    console.log("SELECTED DOCTOR:", doctor);
    console.log(
      "SPECIALIZATION:",
      doctor?.specialization
    );

    setSelectedDoctor(doctor || null);
  };

  // =========================
  // BOOK APPOINTMENT
  // =========================

  const bookAppointment = async () => {
    try {
      setMessage("");
      setError("");
      setBooking(true);

      // =========================
      // GET LOGGED-IN PATIENT
      // =========================

      const storedUser = localStorage.getItem("hmsUser");

      if (!storedUser) {
        setError("Patient is not logged in.");
        setBooking(false);
        return;
      }

      const user = JSON.parse(storedUser);

      console.log("LOGGED-IN PATIENT:", user);

      if (!user.username) {
        setError("Patient username not found.");
        setBooking(false);
        return;
      }

      // =========================
      // VALIDATION
      // =========================

      if (!selectedDoctor) {
        setError("Please select a doctor.");
        setBooking(false);
        return;
      }

      if (!appointmentDate) {
        setError("Please select appointment date.");
        setBooking(false);
        return;
      }

      if (!appointmentTime) {
        setError("Please select appointment time.");
        setBooking(false);
        return;
      }

      // =========================
      // CREATE DATE + TIME
      // =========================

      const appointmentDateTime =
        `${appointmentDate}T${appointmentTime}:00`;

      // =========================
      // CREATE APPOINTMENT OBJECT
      // =========================

      const appointment = {
        appointmentTime: appointmentDateTime,

        // Backend stores doctor username
        doctorName: selectedDoctor.username,

        patientName: user.username,

        // Backend also sets this to Scheduled
        status: "Scheduled",
      };

      console.log(
        "SENDING APPOINTMENT:",
        appointment
      );

      // =========================
      // STEP 1
      // CREATE APPOINTMENT
      // =========================

      const appointmentResponse = await fetch(
        "http://localhost:8080/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointment),
        }
      );

      console.log(
        "APPOINTMENT STATUS:",
        appointmentResponse.status
      );

      if (!appointmentResponse.ok) {
        const errorText =
          await appointmentResponse.text();

        console.error(
          "APPOINTMENT BACKEND ERROR:",
          errorText
        );

        throw new Error(
          "Failed to create appointment."
        );
      }

      const savedAppointment =
        await appointmentResponse.json();

      console.log(
        "SAVED APPOINTMENT:",
        savedAppointment
      );

      // Make sure appointment ID exists
      if (!savedAppointment.id) {
        throw new Error(
          "Appointment created but appointment ID was not returned."
        );
      }

      // =========================
      // STEP 2
      // CREATE PENDING PAYMENT
      // =========================

      // Appointment has now been created.
      // Create a Pending payment for it.

      const paymentAmount = 500;
      const paymentMethod = "UPI";

      console.log(
        "CREATING PAYMENT FOR APPOINTMENT:",
        savedAppointment.id
      );

      const paymentResponse = await fetch(
        `http://localhost:8080/api/payments/create/${savedAppointment.id}?amount=${paymentAmount}&paymentMethod=${paymentMethod}`,
        {
          method: "POST",
        }
      );

      console.log(
        "PAYMENT CREATION STATUS:",
        paymentResponse.status
      );

      if (!paymentResponse.ok) {
        const paymentError =
          await paymentResponse.text();

        console.error(
          "PAYMENT CREATION ERROR:",
          paymentError
        );

        throw new Error(
          "Appointment created, but payment could not be created."
        );
      }

      const payment =
        await paymentResponse.json();

      console.log(
        "PENDING PAYMENT CREATED:",
        payment
      );

      // =========================
      // VERIFY PAYMENT STATUS
      // =========================

      if (
        payment.status?.toLowerCase() !==
        "pending"
      ) {
        console.warn(
          "Unexpected payment status:",
          payment.status
        );
      }

      // =========================
      // SUCCESS
      // =========================

      setMessage(
        "Appointment created. Please complete your payment."
      );

      // =========================
      // CLEAR FORM
      // =========================

      setSelectedDoctor(null);
      setAppointmentDate("");
      setAppointmentTime("");

      // =========================
      // GO TO PAYMENT PAGE
      // =========================

      setTimeout(() => {
        navigate("/payments");
      }, 800);

    } catch (err) {
      console.error(
        "BOOKING ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "750px",
          margin: "auto",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "15px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >

        {/* HEADER */}

        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#222",
          }}
        >
          Book Appointment
        </h1>

        {/* ERROR */}

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#842029",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div
            style={{
              backgroundColor: "#d1e7dd",
              color: "#0f5132",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {message}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <p
            style={{
              textAlign: "center",
            }}
          >
            Loading available doctors...
          </p>
        )}

        {/* DOCTOR SECTION */}

        {!loading && doctors.length > 0 && (
          <>
            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Select Doctor
            </label>

            <select
              value={selectedDoctor?.id || ""}
              onChange={handleDoctorChange}
              disabled={booking}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            >
              <option value="">
                -- Select a Doctor --
              </option>

              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  Dr.{" "}
                  {doctor.fullName ||
                    doctor.username ||
                    "Doctor"}
                </option>
              ))}
            </select>

            {/* SELECTED DOCTOR */}

            {selectedDoctor && (
              <div
                style={{
                  backgroundColor: "#eef6ff",
                  padding: "20px",
                  borderRadius: "10px",
                  marginBottom: "25px",
                  borderLeft:
                    "5px solid #007bff",
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                    color: "#007bff",
                  }}
                >
                  Dr.{" "}
                  {selectedDoctor.fullName ||
                    "Doctor"}
                </h2>

                <p>
                  <strong>
                    Username:
                  </strong>{" "}
                  {selectedDoctor.username}
                </p>

                <p>
                  <strong>
                    Specialization:
                  </strong>{" "}
                  {selectedDoctor.specialization ||
                    "Not specified"}
                </p>
              </div>
            )}

            {/* DATE */}

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Appointment Date
            </label>

            <input
              type="date"
              value={appointmentDate}
              disabled={booking}
              onChange={(e) =>
                setAppointmentDate(
                  e.target.value
                )
              }
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />

            {/* TIME */}

            <label
              style={{
                display: "block",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Appointment Time
            </label>

            <input
              type="time"
              value={appointmentTime}
              disabled={booking}
              onChange={(e) =>
                setAppointmentTime(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "25px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />

            {/* PAYMENT INFO */}

            <div
              style={{
                backgroundColor: "#fff8e1",
                border: "1px solid #ffe082",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <strong>
                Appointment Fee: ₹500
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                After booking, you will be
                redirected to the payment page
                to complete the payment.
              </p>
            </div>

            {/* BOOK BUTTON */}

            <button
              onClick={bookAppointment}
              disabled={booking}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: booking
                  ? "#6c757d"
                  : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "17px",
                fontWeight: "bold",
                cursor: booking
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {booking
                ? "Creating Appointment..."
                : "Book Appointment & Continue to Payment"}
            </button>
          </>
        )}

        {/* NO DOCTORS */}

        {!loading &&
          doctors.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "#666",
              }}
            >
              No doctors available.
            </p>
          )}

        {/* BACK */}

        <button
          onClick={() => navigate("/patient")}
          disabled={booking}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: booking
              ? "not-allowed"
              : "pointer",
          }}
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  );
}

export default BookAppointment;