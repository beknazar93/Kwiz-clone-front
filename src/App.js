import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./components/Landing/Landing";
import Game from "./components/Game/Game";
import Player from "./components/Game/Player";

import UserProfile from "./components/Profile/UserProfile";
import Winners from "./components/Profile/Winners";
import SchoolManagement from "./components/Profile/SchoolManagement";

import Main from "./components/Host/Main";
import NewQuiz from "./components/Host/NewQuiz";
import Questions from "./components/Host/Questions";
import NewQuestion from "./components/Host/NewQuestion";
import EditQuestion from "./components/Host/EditQuestion";

import "./App.css";
import Login from "./components/Profile/Login";
import Register from "./components/Profile/Register";
import PrivateRoute from "./components/PrivateRoute";
import SettingsScreen from "./components/Game/SettingsScreen";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<Game />} />
        <Route path="/player" element={<Player />} />
        <Route path="/game-settings" element={<SettingsScreen />} />

        {/* 🧑‍💼 Профиль администратора */}
        {/* Защищённый маршрут только для админа */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roleRequired="admin">
              <UserProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/school-management"
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <SchoolManagement />
            </PrivateRoute>
          }
        />

        <Route path="/winners" element={<Winners />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🧠 Host */}
        <Route path="/host" element={<Main />} />
        <Route path="/host/newquiz" element={<NewQuiz />} />
        <Route path="/host/questions" element={<Questions />} />
        <Route path="/host/newquestion/:id" element={<NewQuestion />} />
        <Route path="/host/editquestion/:id" element={<EditQuestion />} />
      </Routes>
    </div>
  );
};

export default App;
