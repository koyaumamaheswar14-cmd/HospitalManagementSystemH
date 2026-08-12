import { useEffect, useState } from "react";

function PatientDetails() {
  const [patient, setPatient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedUser = localStorage.getItem("hmsUser");

      if (!storedUser) {
        setMessage("Patient is not logged in.");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await fetch(
        `http://localhost:8080/api/auth/profile/${encodeURIComponent(
          user.username
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();

      setPatient(data);
      setFullName(data.fullName || "");
      setEmail(data.email || "");
    } catch (error) {
      console.error(error);
      setMessage("Unable to load profile.");
    }
  };

  const updateProfile = async () => {
    try {
      setMessage("");

      const storedUser = localStorage.getItem("hmsUser");

      if (!storedUser) {
        setMessage("Patient is not logged in.");
        return;
      }

      const user = JSON.parse(storedUser);

      const response = await fetch(
        `http://localhost:8080/api/auth/profile/${encodeURIComponent(
          user.username
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: fullName,
            email: email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "Failed to update profile"
        );
      }

      const updatedUser = await response.json();

      setPatient(updatedUser);
      setFullName(updatedUser.fullName || "");
      setEmail(updatedUser.email || "");

      // Keep localStorage updated
      localStorage.setItem(
        "hmsUser",
        JSON.stringify({
          ...user,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
        })
      );

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to update profile.");
    }
  };

  if (!patient) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        {message || "Loading profile..."}
      </div>
    );
  }

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
          maxWidth: "600px",
          margin: "auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1b3c59",
            marginBottom: "30px",
          }}
        >
          My Profile
        </h1>

        {message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "#d1e7dd",
              color: "#0f5132",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Username</strong>
          </label>

          <input
            value={patient.username || ""}
            disabled
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Full Name</strong>
          </label>

          <input
            value={fullName}
            disabled={!editing}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Email</strong>
          </label>

          <input
            value={email}
            disabled={!editing}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <strong>Role</strong>
          </label>

          <input
            value={patient.role || ""}
            disabled
            style={inputStyle}
          />
        </div>

        {!editing ? (
          <button
            onClick={() => {
              setEditing(true);
              setMessage("");
            }}
            style={buttonStyle}
          >
            Edit Profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={updateProfile}
              style={{
                ...buttonStyle,
                backgroundColor: "#28a745",
              }}
            >
              Save Changes
            </button>

            <button
              onClick={() => {
                setEditing(false);
                setFullName(patient.fullName || "");
                setEmail(patient.email || "");
                setMessage("");
              }}
              style={{
                ...buttonStyle,
                backgroundColor: "#6c757d",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

export default PatientDetails;