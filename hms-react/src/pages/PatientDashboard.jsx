import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Search,
  FileText,
  CreditCard,
  Stethoscope,
  UserCircle,
  LogOut,
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("hmsUser")
  );

  const logout = () => {
    localStorage.removeItem("hmsUser");
    localStorage.removeItem("token");
    navigate("/");
  };

  const cards = [
    {
      title: "Book Appointment",
      desc: "Schedule a new appointment with a doctor.",
      icon: <CalendarDays size={28} />,
      action: () => navigate("/book-appointment"),
      btn: "Book Now",
    },
    {
      title: "Track Appointment",
      desc: "Check status of upcoming or past appointments.",
      icon: <Search size={28} />,
     action: () => navigate("/track-appointment"),
      btn: "Track",
    },
    {
      title: "Reports",
      desc: "View medical test results and diagnosis reports.",
      icon: <FileText size={28} />,
      action: () => alert("Opening reports..."),
      btn: "View Reports",
    },
{
  title: "Payments",
  desc: "Pay hospital fees or appointment charges.",
  icon: <CreditCard size={28} />,
  action: () => {
    window.location.href = "/patient-payments";
  },
  btn: "View Payments",
},
    {
      title: "Doctors",
      desc: "View doctor details, specialization, and availability.",
      icon: <Stethoscope size={28} />,
      action: () => navigate("/doctors"),
      btn: "View Doctors",
    },
  {
  title: "My Profile",
  desc: "Manage your personal health records and info.",
  icon: <UserCircle size={28} />,
  action: () => navigate("/patient/profile"),
  btn: "View Profile",
},
  ];

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <div style={styles.container}>

          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>
                Welcome To Hospital Management System
              </h1>

              <p style={styles.subtitle}>
                Welcome,{" "}
                <b>{user?.fullName || "Patient"}</b>
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

          {/* Cards */}
          <div style={styles.grid}>
            {cards.map((c, index) => (
              <div
                key={index}
                style={styles.card}
              >
                <div style={styles.iconBox}>
                  {c.icon}
                </div>

                <h3 style={styles.cardTitle}>
                  {c.title}
                </h3>

                <p style={styles.cardDesc}>
                  {c.desc}
                </p>

                <button
                  style={styles.primaryBtn}
                  onClick={c.action}
                >
                  {c.btn}
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              💡 Book appointments with available
              doctors through the hospital system.
            </p>
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
  },

  overlay: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.72)",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  container: {
    width: "100%",
    maxWidth: "1200px",
    background: "rgba(255,255,255,0.10)",
    border:
      "1px solid rgba(255,255,255,0.2)",
    borderRadius: "20px",
    padding: "28px",
    backdropFilter: "blur(10px)",
    boxShadow:
      "0 8px 25px rgba(0,0,0,0.55)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
    color: "#fff",
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    textShadow: "1px 1px 3px black",
  },

  subtitle: {
    marginTop: "6px",
    color: "#ddd",
    fontSize: "14px",
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
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },

  card: {
    background:
      "rgba(255,255,255,0.14)",
    borderRadius: "18px",
    padding: "22px",
    textAlign: "center",
    color: "#fff",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.45)",
    border:
      "1px solid rgba(255,255,255,0.15)",
  },

  iconBox: {
    width: "55px",
    height: "55px",
    margin: "0 auto 12px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "rgba(255,255,255,0.18)",
  },

  cardTitle: {
    fontSize: "18px",
    marginBottom: "6px",
  },

  cardDesc: {
    fontSize: "13px",
    color: "#ddd",
    marginBottom: "14px",
    minHeight: "35px",
  },

  primaryBtn: {
    padding: "10px 18px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
    background:
      "linear-gradient(to right, #00c6ff, #0072ff)",
  },

  footer: {
    marginTop: "20px",
    textAlign: "center",
  },

  footerText: {
    color: "#cfd8dc",
    fontSize: "13px",
  },
};