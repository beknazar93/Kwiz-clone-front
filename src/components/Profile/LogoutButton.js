import React from "react";

const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login"; // или "/"
  };

  return <button onClick={handleLogout}>Выйти</button>;
};

export default LogoutButton;
