import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ViewPatients() {
  const [visits, setVisits] = useState([]);
  const [openRow, setOpenRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const storedUser = localStorage.getItem("hmsUser");

      if (!storedUser) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);

      console.log("Logged-in doctor:", user);

      if (!user.username) {
        console.error("Doctor username not found");
        setLoading(false);
        return;
      }

      console.log(
        "Fetching appointments for:",
        user.username
      );

      const response = await API.get(
        `/api/appointments/doctor/${user.username}`
      );

      console.log(
        "Appointments received:",
        response.data
      );

      setVisits(response.data);
    } catch (error) {
      console.error(
        "Failed to load appointments:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleDateString();
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleTimeString();
  };

  return (
    <div className="visit-container">
      <style>{`
        .visit-container {
          padding: 25px;
          background: #f4f7fb;
          min-height: 100vh;
          font-family: Arial, Helvetica, sans-serif;
        }

        h2 {
          color: #1b3c59;
          margin-bottom: 18px;
        }

        .visit-table {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .visit-header,
        .visit-row {
          display: grid;
          grid-template-columns: 1.3fr 1.2fr 1.2fr 1fr 1fr;
          padding: 14px 18px;
          align-items: center;
        }

        .visit-header {
          background: #e9f2ff;
          font-weight: bold;
          color: #1b3c59;
          border-bottom: 1px solid #ddd;
        }

        .visit-row {
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background 0.15s;
        }

        .visit-row:hover {
          background: #f6faff;
        }

        .patient-name {
          color: #1976d2;
          font-weight: 600;
        }

        .status {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-align: center;
          width: fit-content;
        }

        .status.scheduled {
          background: #fff3cd;
          color: #856404;
        }

        .status.completed {
          background: #d4edda;
          color: #155724;
        }

        .status.cancelled {
          background: #f8d7da;
          color: #721c24;
        }

        .open-btn {
          background: #1976d2;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          color: white;
          cursor: pointer;
        }

        .open-btn:hover {
          background: #125ca1;
        }

        .history-panel {
          background: #f8fbff;
          padding: 12px 20px;
          border-left: 4px solid #1976d2;
        }

        .history-title {
          font-size: 14px;
          margin-bottom: 6px;
          color: #1b3c59;
        }

        .history-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          padding: 5px 0;
          font-size: 14px;
        }

        .done {
          color: #2e7d32;
          font-weight: 600;
        }

        .no-history {
          font-size: 13px;
          color: #777;
        }

        .empty-message {
          padding: 40px;
          text-align: center;
          color: #777;
        }

        .back-btn {
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: #37474f;
          color: white;
          padding: 10px 18px;
          border-radius: 25px;
          border: none;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }

        .back-btn:hover {
          background: #263238;
        }
      `}</style>

      <h2>Patient Visits</h2>

      {loading ? (
        <div className="empty-message">
          Loading patient visits...
        </div>
      ) : visits.length === 0 ? (
        <div className="empty-message">
          No patient appointments found.
        </div>
      ) : (
        <div className="visit-table">

          {/* HEADER */}
          <div className="visit-header">
            <span>Patient</span>
            <span>Date</span>
            <span>Time</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {/* PATIENT ROWS */}
          {visits.map((v, index) => {
            const status =
              v.status?.toLowerCase() || "";

            return (
              <div key={v.id || index}>

                <div
                  className="visit-row"
                  onClick={() =>
                    toggleRow(v.id || index)
                  }
                >
                  <span className="patient-name">
                    {v.patientName}
                  </span>

                  <span>
                    {formatDate(v.appointmentTime)}
                  </span>

                  <span>
                    {formatTime(v.appointmentTime)}
                  </span>

                  <span
                    className={`status ${status}`}
                  >
                    {v.status}
                  </span>

                  <span>
                    <button
                      className="open-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        if (status === "scheduled") {
                          alert(
                            `Consultation for ${v.patientName}`
                          );
                        } else {
                          alert(
                            `Viewing ${v.patientName}'s appointment`
                          );
                        }
                      }}
                    >
                      {status === "scheduled"
                        ? "Consult"
                        : "View"}
                    </button>
                  </span>
                </div>

                {/* EXPANDED ROW */}
                {openRow === (v.id || index) && (
                  <div className="history-panel">
                    <div className="history-title">
                      Appointment Details
                    </div>

                    <div className="history-row">
                      <span>
                        <strong>Patient</strong>
                      </span>

                      <span>
                        {v.patientName}
                      </span>

                      <span />
                    </div>

                    <div className="history-row">
                      <span>
                        <strong>Doctor</strong>
                      </span>

                      <span>
                        {v.doctorName}
                      </span>

                      <span />
                    </div>

                    <div className="history-row">
                      <span>
                        <strong>Status</strong>
                      </span>

                      <span>
                        {v.status}
                      </span>

                      <span />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        className="back-btn"
        onClick={() => navigate("/doctor")}
      >
        ← Back
      </button>
    </div>
  );
}

export default ViewPatients;