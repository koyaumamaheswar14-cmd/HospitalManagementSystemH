import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Doctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      console.log("DOCTORS STATUS:", response.status);

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("DOCTORS FROM BACKEND:", data);

      if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        setDoctors([]);
        setError("Invalid doctor data received.");
      }
    } catch (error) {
      console.error(
        "Failed to fetch doctors:",
        error
      );

      setError("Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* HEADER */}

      <h1
        style={{
          textAlign: "center",
          color: "#1b3c59",
          marginBottom: "30px",
        }}
      >
        Available Doctors
      </h1>

      {/* LOADING */}

      {loading && (
        <h3
          style={{
            textAlign: "center",
          }}
        >
          Loading doctors...
        </h3>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div
          style={{
            textAlign: "center",
            color: "#dc3545",
            backgroundColor: "white",
            padding: "25px",
            maxWidth: "500px",
            margin: "auto",
            borderRadius: "10px",
          }}
        >
          <h3>{error}</h3>

          <button
            onClick={fetchDoctors}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* NO DOCTORS */}

      {!loading &&
        !error &&
        doctors.length === 0 && (
          <div
            style={{
              textAlign: "center",
              backgroundColor: "white",
              padding: "30px",
              maxWidth: "500px",
              margin: "auto",
              borderRadius: "10px",
            }}
          >
            <h3>No doctors available</h3>
          </div>
        )}

      {/* DOCTORS */}

      {!loading &&
        !error &&
        doctors.length > 0 && (
          <div
            style={{
              maxWidth: "1000px",
              margin: "auto",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "25px",
            }}
          >
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                style={{
                  backgroundColor: "white",
                  padding: "25px",
                  borderRadius: "15px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {/* DOCTOR ICON */}

                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    backgroundColor: "#e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "35px",
                    margin: "0 auto 15px",
                  }}
                >
                  👨‍⚕️
                </div>

                {/* FULL NAME */}

                <h2
                  style={{
                    textAlign: "center",
                    color: "#007bff",
                    marginBottom: "20px",
                  }}
                >
                  Dr. {doctor.fullName || "Doctor"}
                </h2>

                {/* SPECIALIZATION */}

                <p>
                  <strong>
                    Specialization:
                  </strong>{" "}
                  {doctor.specialization ||
                    "Not specified"}
                </p>

                {/* AVAILABILITY */}

                <p>
                  <strong>
                    Availability:
                  </strong>{" "}
                  {doctor.availability ||
                    "Not specified"}
                </p>

                {/* BOOK BUTTON */}

                <button
                  onClick={() =>
                    navigate(
                      `/book-appointment?doctor=${doctor.id}`
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    padding: "12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}

      {/* BACK BUTTON */}

      <button
        onClick={() => navigate("/patient")}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          padding: "12px 20px",
          backgroundColor: "#37474f",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
    </div>
  );
}

export default Doctors;