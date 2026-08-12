import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  Circle,
  PlayCircle,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";

function ManageAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ==============================
  // FETCH DOCTOR APPOINTMENTS
  // ==============================

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("hmsUser");

      if (!storedUser) {
        setError("Doctor is not logged in.");
        return;
      }

      const user = JSON.parse(storedUser);

      const username =
        user.username ||
        user.name ||
        user.doctorName;

      if (!username) {
        setError(
          "Doctor username not found. Please login again."
        );
        return;
      }

      const url =
        `http://localhost:8080/api/appointments/doctor/${encodeURIComponent(
          username
        )}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Backend returned invalid appointment data."
        );
      }

      setAppointments(data);
    } catch (error) {
      console.error(
        "Failed to fetch appointments:",
        error
      );

      setError("Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UPDATE STATUS
  // ==============================

  const updateStatus = async (
    appointmentId,
    newStatus
  ) => {
    try {
      setUpdatingId(appointmentId);

      let location = "Hospital";

      if (newStatus === "Confirmed") {
        location = "Doctor's Office";
      }

      if (newStatus === "In Progress") {
        location = "Consultation Room";
      }

      if (newStatus === "Completed") {
        location = "Hospital";
      }

      const url =
        `http://localhost:8080/api/appointments/${appointmentId}/status` +
        `?status=${encodeURIComponent(newStatus)}` +
        `&location=${encodeURIComponent(location)}`;

      const response = await fetch(url, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Server returned ${response.status}`
        );
      }

      const updatedAppointment =
        await response.json();

      setAppointments(
        (previousAppointments) =>
          previousAppointments.map(
            (appointment) =>
              appointment.id === appointmentId
                ? {
                    ...appointment,
                    ...updatedAppointment,
                  }
                : appointment
          )
      );
    } catch (error) {
      console.error(
        "Failed to update appointment:",
        error
      );

      alert(
        error.message ||
          "Unable to update appointment status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==============================
  // NEXT ACTION
  // ==============================

  const getNextAction = (status) => {
    if (status === "Scheduled") {
      return {
        text: "Accept Appointment",
        nextStatus: "Confirmed",
      };
    }

    if (status === "Confirmed") {
      return {
        text: "Start Consultation",
        nextStatus: "In Progress",
      };
    }

    if (status === "In Progress") {
      return {
        text: "Complete Appointment",
        nextStatus: "Completed",
      };
    }

    return null;
  };

  // ==============================
  // STATUS CONFIG
  // ==============================

  const getStatusConfig = (status) => {
    switch (status) {
      case "Scheduled":
        return {
          background: "#fff7ed",
          color: "#c2410c",
          border: "#fed7aa",
          icon: <Circle size={14} />,
        };

      case "Confirmed":
        return {
          background: "#eff6ff",
          color: "#1d4ed8",
          border: "#bfdbfe",
          icon: <CheckCircle2 size={14} />,
        };

      case "In Progress":
        return {
          background: "#ecfeff",
          color: "#0e7490",
          border: "#a5f3fc",
          icon: <PlayCircle size={14} />,
        };

      case "Completed":
        return {
          background: "#f0fdf4",
          color: "#15803d",
          border: "#bbf7d0",
          icon: <CheckCircle2 size={14} />,
        };

      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
          border: "#d1d5db",
          icon: <Circle size={14} />,
        };
    }
  };

  // ==============================
  // PROGRESS
  // ==============================

  const getProgress = (status) => {
    switch (status) {
      case "Scheduled":
        return 25;

      case "Confirmed":
        return 50;

      case "In Progress":
        return 75;

      case "Completed":
        return 100;

      default:
        return 0;
    }
  };

  // ==============================
  // COUNTS
  // ==============================

  const scheduledCount = appointments.filter(
    (a) => a.status === "Scheduled"
  ).length;

  const confirmedCount = appointments.filter(
    (a) => a.status === "Confirmed"
  ).length;

  const inProgressCount = appointments.filter(
    (a) => a.status === "In Progress"
  ).length;

  const completedCount = appointments.filter(
    (a) => a.status === "Completed"
  ).length;

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>
            <RefreshCw size={30} />
          </div>

          <h2>Loading Appointments</h2>

          <p>
            Fetching your patient appointments...
          </p>
        </div>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>

          <button
            onClick={() => navigate("/doctor")}
            style={styles.backButton}
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.title}>
                Manage Appointments
              </h1>

              <p style={styles.subtitle}>
                View and manage your patient appointments
              </p>
            </div>

            <button
              onClick={fetchAppointments}
              style={styles.refreshButton}
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            <div>
              <strong>Unable to load appointments</strong>
              <p>{error}</p>
            </div>

            <button
              onClick={fetchAppointments}
              style={styles.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* STATISTICS */}

        {!error && (
          <div style={styles.statsGrid}>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#eff6ff",
                  color: "#2563eb",
                }}
              >
                <CalendarDays size={22} />
              </div>

              <div>
                <span style={styles.statLabel}>
                  Total
                </span>

                <strong style={styles.statNumber}>
                  {appointments.length}
                </strong>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#fff7ed",
                  color: "#ea580c",
                }}
              >
                <Circle size={22} />
              </div>

              <div>
                <span style={styles.statLabel}>
                  Scheduled
                </span>

                <strong style={styles.statNumber}>
                  {scheduledCount}
                </strong>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#eff6ff",
                  color: "#2563eb",
                }}
              >
                <CheckCircle2 size={22} />
              </div>

              <div>
                <span style={styles.statLabel}>
                  Confirmed
                </span>

                <strong style={styles.statNumber}>
                  {confirmedCount}
                </strong>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#ecfeff",
                  color: "#0891b2",
                }}
              >
                <PlayCircle size={22} />
              </div>

              <div>
                <span style={styles.statLabel}>
                  In Progress
                </span>

                <strong style={styles.statNumber}>
                  {inProgressCount}
                </strong>
              </div>
            </div>

            <div style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#f0fdf4",
                  color: "#16a34a",
                }}
              >
                <ClipboardCheck size={22} />
              </div>

              <div>
                <span style={styles.statLabel}>
                  Completed
                </span>

                <strong style={styles.statNumber}>
                  {completedCount}
                </strong>
              </div>
            </div>

          </div>
        )}

        {/* EMPTY */}

        {!error &&
          appointments.length === 0 && (
            <div style={styles.emptyCard}>

              <div style={styles.emptyIcon}>
                <CalendarDays size={42} />
              </div>

              <h2>No Appointments Yet</h2>

              <p>
                You currently don't have any patient
                appointments.
              </p>

              <button
                onClick={fetchAppointments}
                style={styles.primaryButton}
              >
                <RefreshCw size={17} />
                Refresh Appointments
              </button>

            </div>
          )}

        {/* APPOINTMENTS */}

        {!error &&
          appointments.length > 0 && (
            <div style={styles.appointmentList}>

              {appointments.map(
                (appointment, index) => {

                  const date = new Date(
                    appointment.appointmentTime
                  );

                  const action =
                    getNextAction(
                      appointment.status
                    );

                  const isUpdating =
                    updatingId === appointment.id;

                  const statusConfig =
                    getStatusConfig(
                      appointment.status
                    );

                  const progress =
                    getProgress(
                      appointment.status
                    );

                  return (
                    <div
                      key={
                        appointment.id || index
                      }
                      style={styles.appointmentCard}
                    >

                      {/* CARD HEADER */}

                      <div style={styles.cardHeader}>

                        <div style={styles.patientSection}>

                          <div style={styles.patientAvatar}>
                            <User size={24} />
                          </div>

                          <div>
                            <h2 style={styles.patientName}>
                              {appointment.patientName}
                            </h2>

                            <span style={styles.appointmentId}>
                              Appointment #
                              {appointment.id}
                            </span>
                          </div>

                        </div>

                        <div
                          style={{
                            ...styles.statusBadge,
                            backgroundColor:
                              statusConfig.background,
                            color:
                              statusConfig.color,
                            borderColor:
                              statusConfig.border,
                          }}
                        >
                          {statusConfig.icon}
                          {appointment.status}
                        </div>

                      </div>

                      {/* DETAILS */}

                      <div style={styles.detailsGrid}>

                        <div style={styles.detailBox}>
                          <CalendarDays
                            size={20}
                            color="#2563eb"
                          />

                          <div>
                            <span style={styles.detailLabel}>
                              Date
                            </span>

                            <strong>
                              {date.toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </strong>
                          </div>
                        </div>

                        <div style={styles.detailBox}>
                          <Clock
                            size={20}
                            color="#7c3aed"
                          />

                          <div>
                            <span style={styles.detailLabel}>
                              Time
                            </span>

                            <strong>
                              {date.toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </strong>
                          </div>
                        </div>

                        <div style={styles.detailBox}>
                          <Stethoscope
                            size={20}
                            color="#059669"
                          />

                          <div>
                            <span style={styles.detailLabel}>
                              Doctor
                            </span>

                            <strong>
                              {appointment.doctorName}
                            </strong>
                          </div>
                        </div>

                      </div>

                      {/* TRACKING */}

                      <div style={styles.trackingSection}>

                        <div style={styles.trackingHeader}>
                          <span>
                            Appointment Progress
                          </span>

                          <strong>
                            {progress}%
                          </strong>
                        </div>

                        <div style={styles.progressBackground}>
                          <div
                            style={{
                              ...styles.progressBar,
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div style={styles.steps}>

                          <span
                            style={{
                              ...styles.step,
                              color:
                                progress >= 25
                                  ? "#2563eb"
                                  : "#9ca3af",
                            }}
                          >
                            Scheduled
                          </span>

                          <span
                            style={{
                              ...styles.step,
                              color:
                                progress >= 50
                                  ? "#2563eb"
                                  : "#9ca3af",
                            }}
                          >
                            Confirmed
                          </span>

                          <span
                            style={{
                              ...styles.step,
                              color:
                                progress >= 75
                                  ? "#0891b2"
                                  : "#9ca3af",
                            }}
                          >
                            Consultation
                          </span>

                          <span
                            style={{
                              ...styles.step,
                              color:
                                progress >= 100
                                  ? "#16a34a"
                                  : "#9ca3af",
                            }}
                          >
                            Completed
                          </span>

                        </div>

                      </div>

                      {/* ACTION */}

                      {action && (
                        <button
                          disabled={isUpdating}
                          onClick={() =>
                            updateStatus(
                              appointment.id,
                              action.nextStatus
                            )
                          }
                          style={{
                            ...styles.actionButton,
                            opacity:
                              isUpdating ? 0.65 : 1,
                            cursor:
                              isUpdating
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {isUpdating ? (
                            <>
                              <RefreshCw
                                size={18}
                              />
                              Updating...
                            </>
                          ) : (
                            <>
                              {action.nextStatus ===
                                "Confirmed" && (
                                <CheckCircle2
                                  size={18}
                                />
                              )}

                              {action.nextStatus ===
                                "In Progress" && (
                                <PlayCircle
                                  size={18}
                                />
                              )}

                              {action.nextStatus ===
                                "Completed" && (
                                <ClipboardCheck
                                  size={18}
                                />
                              )}

                              {action.text}
                            </>
                          )}
                        </button>
                      )}

                      {/* COMPLETED */}

                      {appointment.status ===
                        "Completed" && (
                        <div style={styles.completedBox}>
                          <CheckCircle2 size={19} />
                          Appointment completed successfully
                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef4ff 0%, #f8fafc 50%, #eef7ff 100%)",
    fontFamily:
      "Inter, Arial, sans-serif",
    padding: "30px 20px 80px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1100px",
    margin: "auto",
  },

  header: {
    marginBottom: "25px",
  },

  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "5px 0",
    marginBottom: "20px",
  },

  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#172554",
    fontWeight: "800",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 16px",
    border: "1px solid #dbeafe",
    background: "white",
    color: "#2563eb",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  statCard: {
    background: "white",
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow:
      "0 5px 18px rgba(15,23,42,0.07)",
    border: "1px solid #e5e7eb",
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "3px",
  },

  statNumber: {
    fontSize: "24px",
    color: "#172554",
  },

  appointmentList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  appointmentCard: {
    background: "white",
    borderRadius: "18px",
    padding: "25px",
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 7px 25px rgba(15,23,42,0.08)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  patientSection: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  patientAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #dbeafe, #eff6ff)",
    color: "#2563eb",
  },

  patientName: {
    margin: 0,
    fontSize: "20px",
    color: "#172554",
  },

  appointmentId: {
    display: "block",
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 13px",
    borderRadius: "20px",
    border: "1px solid",
    fontSize: "13px",
    fontWeight: "700",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "22px",
  },

  detailBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #eef2f7",
  },

  detailLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "11px",
    marginBottom: "4px",
    textTransform: "uppercase",
    fontWeight: "700",
  },

  trackingSection: {
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: "1px solid #eef2f7",
  },

  trackingHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "9px",
    color: "#475569",
    fontSize: "13px",
  },

  progressBackground: {
    height: "7px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background:
      "linear-gradient(90deg, #2563eb, #06b6d4)",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },

  steps: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
    gap: "8px",
  },

  step: {
    fontSize: "11px",
    fontWeight: "600",
  },

  actionButton: {
    width: "100%",
    marginTop: "22px",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "700",
  },

  completedBox: {
    marginTop: "22px",
    padding: "13px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "700",
    fontSize: "14px",
  },

  emptyCard: {
    background: "white",
    padding: "60px 30px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow:
      "0 7px 25px rgba(15,23,42,0.07)",
    border: "1px solid #e5e7eb",
  },

  emptyIcon: {
    width: "75px",
    height: "75px",
    margin: "0 auto 18px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
  },

  primaryButton: {
    marginTop: "15px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 18px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    padding: "18px",
    borderRadius: "12px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  retryButton: {
    padding: "9px 16px",
    background: "#e11d48",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loadingContainer: {
    maxWidth: "500px",
    margin: "120px auto",
    background: "white",
    padding: "45px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow:
      "0 8px 30px rgba(15,23,42,0.08)",
  },

  spinner: {
    width: "60px",
    height: "60px",
    margin: "0 auto 20px",
    borderRadius: "18px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default ManageAppointments;