import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Login Data
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    role: "",
  });

  // Signup Data
  const [signupData, setSignupData] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    role: "",
  });

  // ✅ Signup
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (res.ok && data.username) {
        alert(data.message);
        setIsLogin(true);
      } else {
        alert(data.message || "Signup failed ❌");
      }
    } catch (error) {
      alert("Backend not running ❌ Start Spring Boot");
    }
  };

  // ✅ Login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (res.ok && data.username && data.token) {
        // ✅ Store token + user
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "hmsUser",
          JSON.stringify({
            username: data.username,
            role: data.role,
          })
        );

        alert(data.message);

        // Redirect based on role
        if (data.role.toLowerCase() === "doctor") navigate("/doctor");
        else navigate("/patient");
      } else {
        alert(data.message || "Login failed ❌");
      }
    } catch (error) {
      alert("Backend not running ❌ Start Spring Boot");
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.overlay}>
        {isLogin ? (
          <div style={styles.formContainer}>
            <h2 style={styles.h2}>LOGIN TO HMS</h2>

            <form onSubmit={handleLogin}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                placeholder="Enter username"
                required
              />

              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                placeholder="Enter password"
                required
              />

              <label style={styles.label}>Role</label>
              <select
                style={styles.input}
                value={loginData.role}
                onChange={(e) =>
                  setLoginData({ ...loginData, role: e.target.value })
                }
                required
              >
                <option value="">Select role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>

              <button style={styles.btn}>Login</button>
            </form>

            <p style={styles.link}>
              Don't have an account?{" "}
              <span style={styles.a} onClick={() => setIsLogin(false)}>
                Sign Up
              </span>
            </p>
          </div>
        ) : (
          <div style={styles.formContainer}>
            <h2 style={styles.h2}>Create an Account</h2>

            <form onSubmit={handleSignup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                value={signupData.fullname}
                onChange={(e) =>
                  setSignupData({ ...signupData, fullname: e.target.value })
                }
                placeholder="Your full name"
                required
              />

              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({ ...signupData, email: e.target.value })
                }
                placeholder="Your email"
                required
              />

              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                value={signupData.username}
                onChange={(e) =>
                  setSignupData({ ...signupData, username: e.target.value })
                }
                placeholder="Choose a username"
                required
              />

              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={signupData.password}
                onChange={(e) =>
                  setSignupData({ ...signupData, password: e.target.value })
                }
                placeholder="Create a password"
                required
              />

              <label style={styles.label}>Role</label>
              <select
                style={styles.input}
                value={signupData.role}
                onChange={(e) =>
                  setSignupData({ ...signupData, role: e.target.value })
                }
                required
              >
                <option value="">Select role</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>

              <button style={styles.btn}>Sign Up</button>
            </form>

            <p style={styles.link}>
              Already have an account?{" "}
              <span style={styles.a} onClick={() => setIsLogin(true)}>
                Login
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  body: {
    height: "100vh",
    backgroundImage:
      "url('https://wallpapers.com/images/hd/hospital-background-8uzvaaj1wielv1ca.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  overlay: {
    height: "100%",
    width: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(6px)",
    padding: "20px",
  },
  formContainer: {
    width: "100%",
    maxWidth: "500px",
    padding: "40px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.1)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
  },
  h2: { color: "#fff", textAlign: "center", marginBottom: "20px" },
  label: { color: "#fff", fontWeight: "bold" },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
  },
  btn: {
    width: "100%",
    padding: "12px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(to right, #00c6ff, #0072ff)",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },
  link: { color: "#fff", textAlign: "center", marginTop: "15px" },
  a: { color: "#00c6ff", cursor: "pointer", fontWeight: "bold" },
};
