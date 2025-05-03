import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserShield,
} from "react-icons/fa";

const Register = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    if (!role) {
      alert("Пожалуйста, выберите роль");
      return;
    }

    try {
      const response = await fetch(
        "https://rasu0101.pythonanywhere.com/user/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name,
            email: `${name}@example.com`, // временный email на основе имени
            password: password,
            role: role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Регистрация прошла успешно!");
        window.location.href = "/login"; // перенаправляем на логин
      } else {
        console.error(data);
        alert(
          "Ошибка регистрации: " + (data.detail || "проверьте введённые данные")
        );
      }
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при отправке запроса");
    }
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Регистрация</h2>
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

        <div style={styles.inputGroup}>
          <FaLock style={styles.icon} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
          <div onClick={toggleShowConfirmPassword} style={styles.eyeIcon}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>

        <div style={styles.inputGroup}>
          <FaUserShield style={styles.icon} />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ ...styles.input, backgroundColor: "#2d2d2d" }}
            required
          >
            <option value="">Выберите роль</option>
            <option value="admin">Админ</option>
            <option value="manager">Менеджер</option>
          </select>
        </div>

        <button type="submit" style={styles.button}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#2d2d2d",
    padding: "40px",
    borderRadius: "12px",
    maxWidth: "400px",
    margin: "30px auto",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#ffffff",
    fontSize: "24px",
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
    padding: "8px",
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
    fontSize: "1em",
    appearance: "none",
  },
  eyeIcon: {
    color: "#d3d3d3",
    cursor: "pointer",
    marginLeft: "10px",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#4a90e2",
    color: "#ffffff",
    fontSize: "1em",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginTop: "10px",
  },
  registerText: {
    textAlign: "center",
    marginTop: "15px",
    color: "#d3d3d3",
    fontSize: "14px",
  },
};

export default Register;
