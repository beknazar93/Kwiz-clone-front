import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ children, roleRequired, allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null - загрузка, true/false - результат
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Запрашиваем данные пользователя
    axios
      .get("https://rasu0101.pythonanywhere.com/user/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const user = res.data[0];
          setUserRole(user.role); // Извлекаем role из API
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch((err) => {
        console.error("Error verifying token:", err);
        setIsAuthenticated(false);
        // Если токен истёк, можно удалить его
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      });
  }, []);

  // Пока идёт загрузка, ничего не рендерим
  if (isAuthenticated === null) {
    return <div>Загрузка...</div>; // Можно заменить на спиннер
  }

  // Если не авторизован, редиректим на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем roleRequired
  if (roleRequired && userRole !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  // Проверяем allowedRoles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
