import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={styles.body}>
      <div style={styles.overlay}>
        <img
          src="https://vivekanandha.hospital/wp-content/uploads/2016/09/24x7.png"
          alt="Logo"
          style={styles.logo}
        />

        <h1 style={styles.title}>WELCOME</h1>
        <h1 style={styles.title}>TO</h1>
        <h1 style={styles.title}>HOSPITAL MANAGEMENT SYSTEM</h1>

        <div style={styles.btnGroup}>
          <Link to="/auth" style={styles.btn}>Login</Link>
          <Link to="/auth" style={styles.btn}>Signup</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    height: "100vh",
    backgroundImage:
      "url('https://static.vecteezy.com/system/resources/thumbnails/036/372/442/small_2x/hospital-building-with-ambulance-emergency-car-on-cityscape-background-cartoon-illustration-vector.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  overlay: {
    height: "100%",
    width: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
    backdropFilter: "blur(5px)",
  },
  logo: {
    width: "100px",
    height: "100px",
    marginBottom: "20px",
    animation: "spin 3s linear infinite",
  },
  title: {
    fontSize: "50px",
    color: "#708090",
    textShadow: "2px 2px 8px black",
  },
  btnGroup: {
    display: "flex",
    gap: "20px",
    marginTop: "30px",
  },
  btn: {
    padding: "14px 35px",
    borderRadius: "30px",
    fontWeight: "bold",
    textDecoration: "none",
    background: "linear-gradient(to right, #00c6ff, #0072ff)",
    color: "white",
  },
};
