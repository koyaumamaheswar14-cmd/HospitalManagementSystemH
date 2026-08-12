import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PatientPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  // =========================
  // GET PATIENT PAYMENTS
  // =========================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const storedUser = localStorage.getItem("hmsUser");

      if (!storedUser) {
        setError("Patient is not logged in.");
        return;
      }

      const user = JSON.parse(storedUser);

      console.log("LOGGED-IN USER:", user);

      if (!user.username) {
        setError("Patient username not found.");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/payments/patient/${encodeURIComponent(
          user.username
        )}`
      );

      console.log("PAYMENTS API STATUS:", response.status);

      if (!response.ok) {
        const errorText = await response.text();

        console.error("PAYMENTS ERROR:", errorText);

        throw new Error("Failed to load payments");
      }

      const data = await response.json();

      console.log("PATIENT PAYMENTS:", data);

      if (Array.isArray(data)) {
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("FETCH PAYMENTS ERROR:", err);
      setError(err.message || "Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PAY NOW
  // =========================

  const payNow = async (paymentId) => {
    try {
      setPayingId(paymentId);
      setError("");
      setMessage("");

      console.log("PAYING PAYMENT ID:", paymentId);

      const response = await fetch(
        `http://localhost:8080/api/payments/${paymentId}/pay`,
        {
          method: "PUT",
        }
      );

      console.log("PAYMENT RESPONSE STATUS:", response.status);

      if (!response.ok) {
        const errorText = await response.text();

        console.error("PAYMENT ERROR:", errorText);

        throw new Error(
          errorText || "Payment failed"
        );
      }

      const updatedPayment = await response.json();

      console.log(
        "PAYMENT SUCCESS:",
        updatedPayment
      );

      // Update payment immediately
      setPayments((previousPayments) =>
        previousPayments.map((payment) =>
          payment.id === paymentId
            ? updatedPayment
            : payment
        )
      );

      setMessage(
        `Payment of ₹${updatedPayment.amount} successful. Appointment confirmed.`
      );

      // Refresh from backend
      await fetchPayments();

    } catch (err) {
      console.error("PAYMENT ERROR:", err);

      setError(
        err.message ||
          "Unable to complete payment."
      );
    } finally {
      setPayingId(null);
    }
  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    if (
      status?.toLowerCase() === "paid"
    ) {
      return {
        backgroundColor: "#d1e7dd",
        color: "#0f5132",
      };
    }

    return {
      backgroundColor: "#fff3cd",
      color: "#856404",
    };
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          Loading payments...
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>

          <button
            onClick={() =>
              navigate("/patient")
            }
            style={styles.backButton}
          >
            ← Dashboard
          </button>

          <h1 style={styles.title}>
            Payments
          </h1>

          <p style={styles.subtitle}>
            Manage your appointment payments
          </p>

        </div>

        {/* SUCCESS */}

        {message && (
          <div style={styles.success}>
            ✓ {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* NO PAYMENTS */}

        {!error &&
          payments.length === 0 && (
            <div style={styles.emptyCard}>

              <div style={styles.emptyIcon}>
                💳
              </div>

              <h2>
                No Payments Found
              </h2>

              <p>
                Payments will appear here
                after you book an appointment.
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

        {/* PAYMENT LIST */}

        <div>

          {payments.map((payment) => (

            <div
              key={payment.id}
              style={styles.paymentCard}
            >

              {/* TOP */}

              <div style={styles.cardTop}>

                <div>

                  <h2 style={styles.doctor}>
                    Dr.{" "}
                    {payment.doctorName ||
                      "Doctor"}
                  </h2>

                  <p style={styles.appointment}>
                    Appointment #
                    {payment.appointmentId}
                  </p>

                </div>

                <span
                  style={{
                    ...styles.status,
                    ...getStatusStyle(
                      payment.status
                    ),
                  }}
                >
                  {payment.status}
                </span>

              </div>

              <div style={styles.divider} />

              {/* DETAILS */}

              <div style={styles.details}>

                <div>

                  <span style={styles.label}>
                    Amount
                  </span>

                  <strong style={styles.amount}>
                    ₹{payment.amount}
                  </strong>

                </div>

                <div>

                  <span style={styles.label}>
                    Payment Method
                  </span>

                  <strong>
                    {payment.paymentMethod ||
                      "UPI"}
                  </strong>

                </div>

                <div>

                  <span style={styles.label}>
                    Payment ID
                  </span>

                  <strong>
                    #{payment.id}
                  </strong>

                </div>

              </div>

              {/* =====================
                  PENDING PAYMENT
              ===================== */}

              {payment.status?.toLowerCase() ===
                "pending" && (

                <div>

                  <div style={styles.pendingMessage}>
                    Payment required before
                    appointment confirmation.
                  </div>

                  <button
                    onClick={() =>
                      payNow(payment.id)
                    }
                    disabled={
                      payingId === payment.id
                    }
                    style={{
                      ...styles.payButton,
                      opacity:
                        payingId === payment.id
                          ? 0.7
                          : 1,
                    }}
                  >

                    {payingId === payment.id
                      ? "Processing Payment..."
                      : `Pay ₹${payment.amount}`}

                  </button>

                </div>
              )}

              {/* =====================
                  PAID
              ===================== */}

              {payment.status?.toLowerCase() ===
                "paid" && (

                <div style={styles.paidBox}>

                  ✓ Payment Completed

                  {payment.paidAt && (
                    <span>
                      {" • "}
                      {new Date(
                        payment.paidAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  )}

                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

// =========================
// STYLES
// =========================

const styles = {

  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fa",
    padding: "30px 20px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "850px",
    margin: "auto",
  },

  header: {
    marginBottom: "25px",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "15px",
    marginBottom: "15px",
  },

  title: {
    margin: 0,
    color: "#1b3c59",
    fontSize: "32px",
  },

  subtitle: {
    color: "#6c757d",
    marginTop: "8px",
  },

  loadingCard: {
    maxWidth: "500px",
    margin: "100px auto",
    backgroundColor: "white",
    padding: "40px",
    textAlign: "center",
    borderRadius: "15px",
  },

  success: {
    backgroundColor: "#d1e7dd",
    color: "#0f5132",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  error: {
    backgroundColor: "#f8d7da",
    color: "#842029",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  emptyCard: {
    backgroundColor: "white",
    padding: "50px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08)",
  },

  emptyIcon: {
    fontSize: "50px",
  },

  primaryButton: {
    marginTop: "15px",
    padding: "12px 25px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  paymentCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "15px",
    marginBottom: "20px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  doctor: {
    margin: 0,
    color: "#1b3c59",
  },

  appointment: {
    color: "#777",
    marginBottom: 0,
  },

  status: {
    padding: "7px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  divider: {
    height: "1px",
    backgroundColor: "#eee",
    margin: "20px 0",
  },

  details: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    color: "#777",
    fontSize: "13px",
    marginBottom: "6px",
  },

  amount: {
    fontSize: "22px",
    color: "#007bff",
  },

  pendingMessage: {
    marginTop: "20px",
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#fff8e1",
    color: "#856404",
    borderRadius: "8px",
    fontSize: "14px",
  },

  payButton: {
    width: "100%",
    marginTop: "10px",
    padding: "14px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },

  paidBox: {
    marginTop: "25px",
    padding: "13px",
    backgroundColor: "#d1e7dd",
    color: "#0f5132",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default PatientPayments;