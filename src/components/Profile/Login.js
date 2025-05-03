import React, { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://rasu0101.pythonanywhere.com/user/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("userRole", data.role); // обязательно role

        alert("Успешный вход!");

        if (data.role === "admin") {
          window.location.href = "/admin"; // если админ → редирект на /admin
        } else {
          window.location.href = "/school-management"; // если менеджер → на главную
        }
      } else {
        console.error(data);
        alert("Ошибка входа: " + (data.detail || "проверьте логин и пароль"));
      }
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при отправке запроса");
    }
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Вход в систему</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <FaUser style={styles.icon} />
          <input
            type="text"
            placeholder="Имя пользователя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <FaLock style={styles.icon} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <div onClick={toggleShowPassword} style={styles.eyeIcon}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <button type="submit" style={styles.button}>
          Войти
        </button>
      </form>
    </div>
  );
};

const isMobile = window.innerWidth <= 320;

const styles = {
  container: {
    backgroundColor: "#2d2d2d",
    padding: isMobile ? "20px" : "40px",
    borderRadius: "12px",
    maxWidth: "400px",
    margin: isMobile ? "20px auto" : "60px auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },
  title: {
    textAlign: "center",
    marginBottom: isMobile ? "12px" : "20px",
    color: "#ffffff",
    fontSize: isMobile ? "18px" : "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#2d2d2d",
    border: "1px solid #4a4a4a",
    borderRadius: "8px",
    marginBottom: "15px",
    padding: isMobile ? "6px" : "8px",
    position: "relative",
  },
  icon: {
    marginRight: "10px",
    color: "#d3d3d3",
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    color: "#ffffff",
    fontSize: isMobile ? "0.9em" : "1em",
  },
  eyeIcon: {
    color: "#d3d3d3",
    cursor: "pointer",
    marginLeft: "10px",
  },
  button: {
    padding: isMobile ? "10px" : "12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#4a90e2",
    color: "#ffffff",
    fontSize: isMobile ? "0.95em" : "1em",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginTop: "10px",
  },
  registerText: {
    textAlign: "center",
    marginTop: "15px",
    color: "#d3d3d3",
    fontSize: isMobile ? "12px" : "14px",
  },
};

export default Login;
