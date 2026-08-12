import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={styles.page}>
      <h1 style={{ color: "white" }}>404 - Page Not Found</h1>
      <Link to="/" style={styles.btn}>
        Go Home
      </Link>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#111",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
  },
  btn: {
    padding: "12px 20px",
    borderRadius: "12px",
    background: "linear-gradient(to right, #00c6ff, #0072ff)",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
