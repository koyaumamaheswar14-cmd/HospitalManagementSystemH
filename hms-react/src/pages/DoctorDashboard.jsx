import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  Users,
  FilePlus,
  LogOut,
  User,
  Pencil,
  Save,
  X,
} from "lucide-react";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("hmsUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [editingProfile, setEditingProfile] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    email: user?.email || "",
    specialization: user?.specialization || "",
    phone: user?.phone || "",
    availability: user?.availability || "Mon–Fri, 9:00 AM–2:00 PM",
    status: user?.status || "Available",
  });

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("hmsUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  // =========================
  // PROFILE CHANGE
  // =========================

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // SAVE PROFILE
  // =========================

  const saveProfile = () => {
    const updatedUser = {
      ...user,
      ...profile,
    };

    localStorage.setItem(
      "hmsUser",
      JSON.stringify(updatedUser)
    );

    setEditingProfile(false);

    alert("Profile updated successfully.");
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    setProfile({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      email: user?.email || "",
      specialization: user?.specialization || "",
      phone: user?.phone || "",
      availability:
        user?.availability || "Mon–Fri, 9:00 AM–2:00 PM",
      status: user?.status || "Available",
    });

    setEditingProfile(false);
  };

  // =========================
  // DOCTOR NAME
  // =========================

  const doctorName =
    profile.firstName || profile.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : profile.username || "Doctor";

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <div style={styles.container}>

          {/* =========================
              HEADER
          ========================= */}

          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                Hospital Management System
              </h1>

              <p style={styles.subtitle}>
                Welcome,{" "}
                <b>
                  Dr. {doctorName}
                </b>
              </p>
            </div>

            <button
              style={styles.logoutBtn}
              onClick={logout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* =========================
              DASHBOARD CARDS
          ========================= */}

          <div style={styles.grid}>

            {/* MANAGE APPOINTMENTS */}

            <div style={styles.card}>
              <div style={styles.iconBox}>
                <CalendarCheck size={28} />
              </div>

              <h3 style={styles.cardTitle}>
                Manage Appointments
              </h3>

              <p style={styles.cardDesc}>
                View your appointments, check patient
                details and update appointment status.
              </p>

              <button
                style={styles.primaryBtn}
                onClick={() =>
                  navigate(
                    `/doctor/${profile.username}/manage`
                  )
                }
              >
                Manage Appointments
              </button>
            </div>

            {/* PATIENTS */}

            <div style={styles.card}>
              <div style={styles.iconBox}>
                <Users size={28} />
              </div>

              <h3 style={styles.cardTitle}>
                Patient Details
              </h3>

              <p style={styles.cardDesc}>
                View your patients and access their
                medical information.
              </p>

              <button
                style={styles.primaryBtn}
                onClick={() =>
                  navigate("/patients")
                }
              >
                View Patients
              </button>
            </div>

            {/* REPORTS */}

            <div style={styles.card}>
              <div style={styles.iconBox}>
                <FilePlus size={28} />
              </div>

              <h3 style={styles.cardTitle}>
                Medical Reports
              </h3>

              <p style={styles.cardDesc}>
                Submit and review patient medical
                test reports.
              </p>

              <button
                style={styles.primaryBtn}
                onClick={() =>
                  alert(
                    "Medical reports feature coming soon."
                  )
                }
              >
                View Reports
              </button>
            </div>

          </div>

          {/* =========================
              PROFILE
          ========================= */}

          <div style={styles.profileCard}>

            {/* PROFILE HEADER */}

            <div style={styles.profileHeader}>

              <div style={styles.profileHeading}>
                <div style={styles.profileIcon}>
                  <User size={22} />
                </div>

                <div>
                  <h3 style={{ margin: 0 }}>
                    Your Profile
                  </h3>

                  <p style={styles.profileSubtext}>
                    Manage your professional information
                  </p>
                </div>
              </div>

              {!editingProfile && (
                <button
                  style={styles.editButton}
                  onClick={() =>
                    setEditingProfile(true)
                  }
                >
                  <Pencil size={16} />
                  Edit Profile
                </button>
              )}

              {editingProfile && (
                <div style={styles.actionButtons}>

                  <button
                    style={styles.saveButton}
                    onClick={saveProfile}
                  >
                    <Save size={16} />
                    Save
                  </button>

                  <button
                    style={styles.cancelButton}
                    onClick={cancelEdit}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                </div>
              )}
            </div>

            <div style={styles.profileDivider} />

            {/* PROFILE FIELDS */}

            <div style={styles.profileGrid}>

              {/* FIRST NAME */}

              <div style={styles.field}>
                <label style={styles.label}>
                  First Name
                </label>

                {editingProfile ? (
                  <input
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    style={styles.profileInput}
                  />
                ) : (
                  <p style={styles.value}>
                    {profile.firstName || "Not provided"}
                  </p>
                )}
              </div>

              {/* LAST NAME */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Last Name
                </label>

                {editingProfile ? (
                  <input
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleProfileChange}
                    style={styles.profileInput}
                  />
                ) : (
                  <p style={styles.value}>
                    {profile.lastName || "Not provided"}
                  </p>
                )}
              </div>

              {/* USERNAME */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Username
                </label>

                <p style={styles.value}>
                  {profile.username || "Not provided"}
                </p>
              </div>

              {/* EMAIL */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Email
                </label>

                {editingProfile ? (
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    style={styles.profileInput}
                  />
                ) : (
                  <p style={styles.value}>
                    {profile.email || "Not provided"}
                  </p>
                )}
              </div>

              {/* PHONE */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Phone
                </label>

                {editingProfile ? (
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    style={styles.profileInput}
                  />
                ) : (
                  <p style={styles.value}>
                    {profile.phone || "Not provided"}
                  </p>
                )}
              </div>

              {/* SPECIALIZATION */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Specialization
                </label>

                {editingProfile ? (
                  <input
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleProfileChange}
                    placeholder="Example: Cardiologist"
                    style={styles.profileInput}
                  />
                ) : (
                  <p style={styles.value}>
                    {profile.specialization ||
                      "Not specified"}
                  </p>
                )}
              </div>

              {/* AVAILABILITY */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Availability
                </label>

                {editingProfile ? (
                  <input
                    name="availability"
                    value={profile.availability}
                    onChange={handleProfileChange}
                    style={styles.profileInput}
                  />
                ) : (
                  <p style={styles.value}>
                    {profile.availability ||
                      "Not provided"}
                  </p>
                )}
              </div>

              {/* STATUS */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Status
                </label>

                {editingProfile ? (
                  <select
                    name="status"
                    value={profile.status}
                    onChange={handleProfileChange}
                    style={styles.profileInput}
                  >
                    <option value="Available">
                      Available
                    </option>

                    <option value="Busy">
                      Busy
                    </option>

                    <option value="On Leave">
                      On Leave
                    </option>
                  </select>
                ) : (
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        profile.status === "Available"
                          ? "#d1e7dd"
                          : "#fff3cd",
                      color:
                        profile.status === "Available"
                          ? "#0f5132"
                          : "#856404",
                    }}
                  >
                    {profile.status || "Available"}
                  </span>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage:
      "url('https://wallpapers.com/images/hd/hospital-background-8uzvaaj1wielv1ca.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  },

  overlay: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.72)",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    boxSizing: "border-box",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "20px",
    padding: "28px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.55)",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
    color: "#fff",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "25px",
    textShadow: "1px 1px 3px black",
  },

  subtitle: {
    marginTop: "7px",
    color: "#ddd",
    fontSize: "15px",
  },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "30px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#fff",
    background:
      "linear-gradient(to right, #ff416c, #ff4b2b)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "rgba(255,255,255,0.14)",
    borderRadius: "18px",
    padding: "25px",
    textAlign: "center",
    color: "#fff",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.45)",
    border:
      "1px solid rgba(255,255,255,0.15)",
    transition: "transform 0.2s",
  },

  iconBox: {
    width: "60px",
    height: "60px",
    margin: "0 auto 15px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.18)",
  },

  cardTitle: {
    fontSize: "19px",
    marginBottom: "8px",
  },

  cardDesc: {
    fontSize: "14px",
    color: "#ddd",
    marginBottom: "20px",
    lineHeight: "1.6",
    minHeight: "45px",
  },

  primaryBtn: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
    background:
      "linear-gradient(to right, #00c6ff, #0072ff)",
    width: "100%",
    fontSize: "14px",
  },

  /* PROFILE */

  profileCard: {
    marginTop: "25px",
    background: "rgba(255,255,255,0.14)",
    borderRadius: "18px",
    padding: "25px",
    color: "#fff",
    border:
      "1px solid rgba(255,255,255,0.15)",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.45)",
  },

  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  profileHeading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  profileIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.18)",
  },

  profileSubtext: {
    margin: "4px 0 0",
    color: "#bbb",
    fontSize: "12px",
  },

  profileDivider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.15)",
    margin: "20px 0",
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },

  field: {
    background: "rgba(0,0,0,0.15)",
    padding: "15px",
    borderRadius: "12px",
  },

  label: {
    display: "block",
    color: "#aaa",
    fontSize: "12px",
    marginBottom: "7px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  value: {
    margin: 0,
    color: "#fff",
    fontSize: "15px",
    fontWeight: "500",
    wordBreak: "break-word",
  },

  profileInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.3)",
    outline: "none",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    boxSizing: "border-box",
    fontSize: "14px",
  },

  statusBadge: {
    display: "inline-block",
    padding: "7px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
    background: "#007bff",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
  },

  saveButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
    background: "#198754",
  },

  cancelButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
    background: "#dc3545",
  },
};