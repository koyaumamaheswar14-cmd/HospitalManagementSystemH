import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TrackAppointment() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [error, setError] = useState("");

  // PAYMENT POPUP
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);

  // =====================================================
  // LOAD PATIENT APPOINTMENTS
  // =====================================================

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("hmsUser");

      if (!storedUser) {
        setError("Patient is not logged in.");
        return;
      }

      const user = JSON.parse(storedUser);

      if (!user.username) {
        setError("Patient username not found.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/appointments/patient/${encodeURIComponent(
          user.username
        )}`
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid appointment data.");
      }

      setAppointments(data);

      // =================================================
      // CHECK PAYMENT STATUS
      // =================================================

      const pendingPayment = data.find((appointment) => {
        const paymentStatus =
          appointment.paymentStatus ||
          appointment.payment_status ||
          appointment.payment?.status;

        return (
          paymentStatus &&
          paymentStatus.toString().toLowerCase() === "pending"
        );
      });

      if (pendingPayment) {
        setPendingAppointment(pendingPayment);
        setShowPaymentPopup(true);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError("Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET TRACKING DATA
  // =====================================================

  const fetchTracking = async (id, showLoading = true) => {
    try {
      if (showLoading) {
        setTrackingLoading(true);
      }

      setError("");

      const response = await fetch(
        `http://localhost:8080/api/appointments/${id}/tracking`
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      setSelectedAppointment(data);

      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status: data.currentStatus,
              }
            : appointment
        )
      );
    } catch (err) {
      console.error("Tracking error:", err);
      setError("Unable to load appointment tracking.");
    } finally {
      if (showLoading) {
        setTrackingLoading(false);
      }
    }
  };

  // =====================================================
  // OPEN TRACKING
  // =====================================================

  const trackAppointment = async (id) => {
    await fetchTracking(id, true);
  };

  // =====================================================
  // AUTO REFRESH TRACKING
  // =====================================================

  useEffect(() => {
    if (!selectedAppointment) {
      return;
    }

    const appointmentId = selectedAppointment.appointmentId;

    const interval = setInterval(() => {
      fetchTracking(appointmentId, false);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedAppointment?.appointmentId]);

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (dateTime) => {
    if (!dateTime) return "";

    return new Date(dateTime).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // TIME
  // =====================================================

  const formatTime = (dateTime) => {
    if (!dateTime) return "";

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "#f59e0b";

      case "confirmed":
        return "#0891b2";

      case "in progress":
        return "#2563eb";

      case "completed":
        return "#16a34a";

      case "cancelled":
        return "#dc2626";

      default:
        return "#64748b";
    }
  };

  // =====================================================
  // STATUS DESCRIPTION
  // =====================================================

  const getStatusDescription = (status) => {
    switch (status) {
      case "Scheduled":
        return "Your appointment has been booked.";

      case "Confirmed":
        return "Doctor has accepted your appointment.";

      case "In Progress":
        return "Doctor has started your consultation.";

      case "Completed":
        return "Your appointment has been completed.";

      case "Cancelled":
        return "Your appointment has been cancelled.";

      default:
        return "Appointment status updated.";
    }
  };

  // =====================================================
  // PAYMENT BUTTON
  // =====================================================

  const goToPayment = () => {
    setShowPaymentPopup(false);

    if (pendingAppointment) {
      navigate(`/payment/${pendingAppointment.id}`);
    } else {
      navigate("/payment");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* =================================================
            PAYMENT POPUP
        ================================================= */}

        {showPaymentPopup && pendingAppointment && (
          <div style={styles.popupOverlay}>
            <div style={styles.paymentPopup}>

              <div style={styles.paymentIcon}>
                💳
              </div>

              <h2 style={styles.popupTitle}>
                Payment Pending
              </h2>

              <p style={styles.popupText}>
                Your appointment has been booked successfully,
                but the payment is still pending.
              </p>

              <div style={styles.appointmentBox}>
                <div>
                  <span style={styles.smallLabel}>
                    DOCTOR
                  </span>

                  <strong>
                    Dr. {pendingAppointment.doctorName}
                  </strong>
                </div>

                <div>
                  <span style={styles.smallLabel}>
                    DATE
                  </span>

                  <strong>
                    {formatDate(
                      pendingAppointment.appointmentTime
                    )}
                  </strong>
                </div>
              </div>

              <p style={styles.paymentWarning}>
                Please go to payment and complete your payment
                to confirm your appointment.
              </p>

              <button
                style={styles.paymentButton}
                onClick={goToPayment}
              >
                Go to Payment →
              </button>

              <button
                style={styles.laterButton}
                onClick={() =>
                  setShowPaymentPopup(false)
                }
              >
                Pay Later
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            HEADER
        ================================================= */}

        <div style={styles.header}>

          <button
            onClick={() => navigate("/patient")}
            style={styles.backButton}
          >
            ← Back to Dashboard
          </button>

          <h1 style={styles.title}>
            Appointment Tracking
          </h1>

          <p style={styles.subtitle}>
            Track your appointment status in real time.
          </p>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div style={styles.messageCard}>
            <div style={styles.loader}>
              ⏳
            </div>

            <h3>
              Loading your appointments...
            </h3>

            <p>
              Please wait while we fetch your appointments.
            </p>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div style={styles.errorCard}>
            <strong>
              {error}
            </strong>

            <button
              onClick={fetchAppointments}
              style={styles.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            NO APPOINTMENTS
        ================================================= */}

        {!loading &&
          !error &&
          appointments.length === 0 && (
            <div style={styles.emptyCard}>

              <div style={styles.emptyIcon}>
                📅
              </div>

              <h2>
                No Appointments
              </h2>

              <p>
                You don't have any appointments yet.
              </p>

              <button
                onClick={() =>
                  navigate("/book-appointment")
                }
                style={styles.primaryButton}
              >
                Book Appointment
              </button>

            </div>
          )}

        {/* =================================================
            APPOINTMENT LIST
        ================================================= */}

        {!loading &&
          !error &&
          appointments.length > 0 &&
          !selectedAppointment && (

            <div>

              {appointments.map((appointment) => (

                <div
                  key={appointment.id}
                  style={styles.appointmentCard}
                >

                  {/* TOP */}

                  <div style={styles.appointmentHeader}>

                    <div>

                      <p style={styles.appointmentNumber}>
                        APPOINTMENT #{appointment.id}
                      </p>

                      <h2 style={styles.doctorName}>
                        Dr. {appointment.doctorName}
                      </h2>

                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          getStatusColor(
                            appointment.status
                          ),
                      }}
                    >
                      {appointment.status}
                    </span>

                  </div>

                  {/* INFORMATION */}

                  <div style={styles.infoGrid}>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>
                        DATE
                      </span>

                      <strong>
                        {formatDate(
                          appointment.appointmentTime
                        )}
                      </strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>
                        TIME
                      </span>

                      <strong>
                        {formatTime(
                          appointment.appointmentTime
                        )}
                      </strong>
                    </div>

                    <div style={styles.infoBox}>
                      <span style={styles.infoLabel}>
                        PATIENT
                      </span>

                      <strong>
                        {appointment.patientName}
                      </strong>
                    </div>

                  </div>

                  {/* PAYMENT STATUS */}

                  {(appointment.paymentStatus ||
                    appointment.payment_status) && (

                    <div
                      style={{
                        ...styles.paymentStatus,
                        color:
                          (
                            appointment.paymentStatus ||
                            appointment.payment_status
                          )
                            .toLowerCase() === "pending"
                            ? "#92400e"
                            : "#166534",
                        backgroundColor:
                          (
                            appointment.paymentStatus ||
                            appointment.payment_status
                          )
                            .toLowerCase() === "pending"
                            ? "#fef3c7"
                            : "#dcfce7",
                      }}
                    >
                      💳 Payment:{" "}
                      {appointment.paymentStatus ||
                        appointment.payment_status}
                    </div>
                  )}

                  {/* TRACK */}

                  <button
                    onClick={() =>
                      trackAppointment(
                        appointment.id
                      )
                    }
                    style={styles.trackButton}
                  >
                    View Appointment Tracking →
                  </button>

                </div>
              ))}

            </div>
          )}

        {/* =================================================
            TRACKING DETAILS
        ================================================= */}

        {selectedAppointment && (
          <>

            <button
              onClick={() =>
                setSelectedAppointment(null)
              }
              style={styles.backAppointmentButton}
            >
              ← Back to Appointments
            </button>

            {/* APPOINTMENT CARD */}

            <div style={styles.trackingCard}>

              <div style={styles.trackingHeader}>

                <div>

                  <p style={styles.appointmentNumber}>
                    APPOINTMENT #
                    {selectedAppointment.appointmentId}
                  </p>

                  <h2 style={styles.doctorName}>
                    Dr. {selectedAppointment.doctorName}
                  </h2>

                  <p style={styles.dateText}>
                    {formatDate(
                      selectedAppointment.appointmentTime
                    )}{" "}
                    •{" "}
                    {formatTime(
                      selectedAppointment.appointmentTime
                    )}
                  </p>

                </div>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor:
                      getStatusColor(
                        selectedAppointment.currentStatus
                      ),
                  }}
                >
                  {selectedAppointment.currentStatus}
                </span>

              </div>

              <div style={styles.statusDescription}>
                {getStatusDescription(
                  selectedAppointment.currentStatus
                )}
              </div>

              <div style={styles.liveTracking}>
                ● Live tracking — Updating automatically
              </div>

            </div>

            {/* JOURNEY */}

            <div style={styles.journeyCard}>

              <h2 style={styles.journeyTitle}>
                Appointment Journey
              </h2>

              {trackingLoading && (
                <p style={styles.updatingText}>
                  Updating appointment status...
                </p>
              )}

              {selectedAppointment.timeline &&
                selectedAppointment.timeline.map(
                  (step, index) => (

                    <div
                      key={step.id || index}
                      style={styles.timelineItem}
                    >

                      <div style={styles.timelineLine}>

                        <div
                          style={{
                            ...styles.timelineDot,
                            backgroundColor:
                              getStatusColor(
                                step.status
                              ),
                          }}
                        />

                        {index !==
                          selectedAppointment.timeline
                            .length - 1 && (
                          <div
                            style={
                              styles.timelineConnector
                            }
                          />
                        )}

                      </div>

                      <div style={styles.timelineContent}>

                        <h3
                          style={{
                            margin: 0,
                            color:
                              getStatusColor(
                                step.status
                              ),
                          }}
                        >
                          {step.status}
                        </h3>

                        <p style={styles.location}>
                          📍 {step.location}
                        </p>

                        <p style={styles.updatedAt}>
                          🕐{" "}
                          {formatDate(
                            step.updatedAt
                          )}{" "}
                          at{" "}
                          {formatTime(
                            step.updatedAt
                          )}
                        </p>

                      </div>

                    </div>
                  )
                )}

            </div>

          </>
        )}

      </div>
    </div>
  );
}

export default TrackAppointment;

// =====================================================
// STYLES
// =====================================================

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef4ff, #f8fafc)",
    padding: "35px 20px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "950px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "30px",
  },

  backButton: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "18px",
  },

  title: {
    margin: 0,
    color: "#172b4d",
    fontSize: "32px",
  },

  subtitle: {
    color: "#64748b",
    marginTop: "8px",
  },

  messageCard: {
    background: "white",
    padding: "45px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.07)",
  },

  loader: {
    fontSize: "35px",
  },

  errorCard: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    textAlign: "center",
  },

  retryButton: {
    display: "block",
    margin: "15px auto 0",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
  },

  emptyCard: {
    background: "white",
    padding: "55px 30px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.07)",
  },

  emptyIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },

  primaryButton: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  appointmentCard: {
    background: "white",
    padding: "25px",
    marginBottom: "18px",
    borderRadius: "18px",
    boxShadow: "0 5px 18px rgba(0,0,0,0.07)",
    border: "1px solid #e5e7eb",
  },

  appointmentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "22px",
  },

  appointmentNumber: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "bold",
  },

  doctorName: {
    margin: "7px 0",
    color: "#172b4d",
    fontSize: "22px",
  },

  statusBadge: {
    color: "white",
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },

  infoBox: {
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "10px",
  },

  infoLabel: {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
    marginBottom: "6px",
    fontWeight: "bold",
  },

  paymentStatus: {
    padding: "12px",
    borderRadius: "9px",
    marginBottom: "15px",
    fontWeight: "bold",
    fontSize: "14px",
  },

  trackButton: {
    width: "100%",
    padding: "13px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },

  backAppointmentButton: {
    marginBottom: "20px",
    padding: "10px 16px",
    background: "white",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
  },

  trackingCard: {
    background: "white",
    padding: "28px",
    borderRadius: "18px",
    marginBottom: "22px",
    boxShadow: "0 5px 18px rgba(0,0,0,0.07)",
    border: "1px solid #e5e7eb",
  },

  trackingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  dateText: {
    color: "#64748b",
  },

  statusDescription: {
    marginTop: "22px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "10px",
    color: "#475569",
  },

  liveTracking: {
    marginTop: "15px",
    padding: "11px",
    background: "#ecfdf5",
    color: "#047857",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },

  journeyCard: {
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 5px 18px rgba(0,0,0,0.07)",
    border: "1px solid #e5e7eb",
  },

  journeyTitle: {
    marginTop: 0,
    marginBottom: "30px",
    color: "#172b4d",
  },

  updatingText: {
    color: "#64748b",
    fontSize: "14px",
  },

  timelineItem: {
    display: "flex",
    minHeight: "110px",
  },

  timelineLine: {
    width: "35px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  timelineDot: {
    width: "17px",
    height: "17px",
    borderRadius: "50%",
    border: "4px solid #e8eef5",
    boxSizing: "content-box",
  },

  timelineConnector: {
    width: "3px",
    flex: 1,
    background: "#dbe2ea",
  },

  timelineContent: {
    paddingLeft: "15px",
    paddingBottom: "25px",
  },

  location: {
    margin: "7px 0",
    color: "#475569",
  },

  updatedAt: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "14px",
  },

  // ===================================================
  // PAYMENT POPUP
  // ===================================================

  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
    boxSizing: "border-box",
  },

  paymentPopup: {
    width: "100%",
    maxWidth: "450px",
    background: "white",
    borderRadius: "20px",
    padding: "32px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
  },

  paymentIcon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#fef3c7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "30px",
  },

  popupTitle: {
    margin: "5px 0 10px",
    color: "#172b4d",
    fontSize: "25px",
  },

  popupText: {
    color: "#64748b",
    lineHeight: "1.6",
    fontSize: "15px",
  },

  appointmentBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    textAlign: "left",
    background: "#f8fafc",
    padding: "15px",
    borderRadius: "12px",
    margin: "20px 0",
  },

  smallLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  paymentWarning: {
    color: "#92400e",
    background: "#fef3c7",
    padding: "12px",
    borderRadius: "9px",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  paymentButton: {
    width: "100%",
    padding: "13px",
    marginTop: "10px",
    border: "none",
    borderRadius: "9px",
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },

  laterButton: {
    width: "100%",
    padding: "11px",
    marginTop: "9px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "14px",
  },
};