import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Winners from "./Winners";
import Registration from "./Register";
import Kwizz from "../../Assests/logo.png";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    schools: [],
    levels: [],
  });

  const [users, setUsers] = useState([]);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("Все школы");
  const [activeSection, setActiveSection] = useState("management");
  const [showNamesModal, setShowNamesModal] = useState(false);
  const [namesModalType, setNamesModalType] = useState(null);
  const [namesList, setNamesList] = useState([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newUsername, setNewUsername] = useState(""); // Новое состояние для имени
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("schools");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();

  // Загрузка профиля и пользователей
  useEffect(() => {
    axios
      .get("https://rasu0101.pythonanywhere.com/user/user/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setProfile(res.data[0]);
          setUsers(res.data);
        } else {
          setError("Пользователь не найден");
        }
      })
      .catch((err) => {
        setError("Ошибка загрузки данных: " + err.message);
        console.error("Error fetching data:", err);
      });
  }, []);

  const handleDeleteUser = async (userId) => {
    if (userId === profile.id) {
      setError("Нельзя удалить текущего пользователя");
      return;
    }
    try {
      await axios.delete(
        `https://rasu0101.pythonanywhere.com/user/user/${userId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError("Ошибка удаления пользователя: " + err.message);
      console.error("Error deleting user:", err);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || "manager");
    setNewUsername(user.username || ""); // Инициализируем имя
    setShowEditRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole || !newUsername) {
      setError("Заполните все поля");
      return;
    }
    try {
      const response = await axios.put(
        `https://rasu0101.pythonanywhere.com/user/user/${selectedUser.id}/`,
        {
          username: newUsername, // Обновляем имя
          avatar: selectedUser.avatar,
          schools: selectedUser.schools,
          levels: selectedUser.levels,
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("PUT response:", response.data);

      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, username: newUsername, role: newRole }
            : user
        )
      );
      setShowEditRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      setNewUsername("");
      setError(null);
    } catch (err) {
      setError("Ошибка обновления данных: " + err.message);
      console.error("Error updating user:", err);
    }
  };

  const handleRegistrationSuccess = async () => {
    try {
      const res = await axios.get(
        "https://rasu0101.pythonanywhere.com/user/user/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (res.data && res.data.length > 0) {
        setUsers(res.data);
        setShowRegistrationModal(false);
        setError(null);
      }
    } catch (err) {
      setError("Ошибка обновления списка пользователей: " + err.message);
    }
  };

  const totalSchools = profile.schools?.length || 0;
  const totalLevels = profile.levels?.length || 0;
  const totalParticipants =
    profile.levels?.reduce(
      (sum, level) => sum + (level.participants?.length || 0),
      0
    ) || 0;

  const filteredSchools =
    selectedSchoolFilter === "Все школы"
      ? profile.schools || []
      : (profile.schools || []).filter(
          (school) => school.name === selectedSchoolFilter
        );

  const openNamesModal = (type, names) => {
    setNamesModalType(type);
    setNamesList(names || []);
    setShowNamesModal(true);
  };

  const closeNamesModal = () => {
    setShowNamesModal(false);
    setNamesModalType(null);
    setNamesList([]);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="user-profile">
      {error && <div className="user-profile__error">{error}</div>}
      <aside
        className={`user-profile__sidebar ${
          isSidebarOpen ? "" : "user-profile__sidebar--closed"
        }`}
      >
        {isSidebarOpen && (
          <img className="user-profile__logo" src={Kwizz} alt="Kwizz" />
        )}
        <ul className="user-profile__menu">
          <li
            className={`user-profile__menu-item ${
              activeSection === "management"
                ? "user-profile__menu-item--active"
                : ""
            }`}
            onClick={() => setActiveSection("management")}
          >
            {isSidebarOpen ? "Управление" : "⚙️"}
          </li>
          <li
            className={`user-profile__menu-item ${
              activeSection === "history"
                ? "user-profile__menu-item--active"
                : ""
            }`}
            onClick={() => setActiveSection("history")}
          >
            {isSidebarOpen ? "История матчей" : "📜"}
          </li>
          <li
            className={`user-profile__menu-item ${
              activeSection === "users" ? "user-profile__menu-item--active" : ""
            }`}
            onClick={() => setActiveSection("users")}
          >
            {isSidebarOpen ? "Пользователи" : "👤"}
          </li>
          <li
            className={`user-profile__menu-item ${
              activeSection === "settings"
                ? "user-profile__menu-item--active"
                : ""
            }`}
            onClick={() => setActiveSection("settings")}
          >
            {isSidebarOpen ? "Настройки" : "🔧"}
          </li>
        </ul>
      </aside>

      <main className="user-profile__main">
        <button
          className="user-profile__toggle-sidebar-btn"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? "◄" : "►"}
        </button>
        {activeSection === "management" && (
          <>
            <header className="user-profile__header">
              <h2 className="user-profile__title">Панель управления</h2>
            </header>

            <div className="user-profile__stats">
              <div className="user-profile__stat-card">
                <h3 className="user-profile__stat-title">Школы</h3>
                <p className="user-profile__stat-value">{totalSchools}</p>
              </div>
              <div className="user-profile__stat-card">
                <h3 className="user-profile__stat-title">Уровни</h3>
                <p className="user-profile__stat-value">{totalLevels}</p>
              </div>
              <div className="user-profile__stat-card">
                <h3 className="user-profile__stat-title">Участники</h3>
                <p className="user-profile__stat-value">{totalParticipants}</p>
              </div>
            </div>

            <div className="user-profile__tabs">
              <button
                className={`user-profile__tab ${
                  activeTab === "schools" ? "user-profile__tab--active" : ""
                }`}
                onClick={() => setActiveTab("schools")}
              >
                Школы
              </button>
              <button
                className={`user-profile__tab ${
                  activeTab === "levels" ? "user-profile__tab--active" : ""
                }`}
                onClick={() => setActiveTab("levels")}
              >
                Уровни
              </button>
              <div className="user-profile__filters">
                <select
                  className="user-profile__filter"
                  value={selectedSchoolFilter}
                  onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                >
                  <option>Все школы</option>
                  {(profile.schools || []).map((school) => (
                    <option key={school.id} value={school.name}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <button
                  className="user-profile__action-btn"
                  onClick={() => navigate("/school-management")}
                >
                  ⚙️ Управление школами
                </button>
                <button
                  className="user-profile__action-btn"
                  onClick={() => navigate("/host")}
                >
                  🎮 Играть
                </button>
              </div>
            </div>

            <div className="user-profile__content">
              {activeTab === "schools" && (
                <table className="user-profile__table">
                  <thead>
                    <tr>
                      <th>Школа</th>
                      <th>Класс</th>
                      <th>Ученики</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredSchools || []).map((school) => {
                      const classesCount = school.classes?.length || 0;
                      return classesCount === 0 ? (
                        <tr key={school.id}>
                          <td>{school.name}</td>
                          <td>-</td>
                          <td>-</td>
                        </tr>
                      ) : (
                        school.classes.map((cls, index) => (
                          <tr key={`${school.id}-${cls.id}`}>
                            {index === 0 ? (
                              <td rowSpan={classesCount}>{school.name}</td>
                            ) : null}
                            <td>{cls.name}</td>
                            <td
                              className="user-profile__clickable-cell"
                              onClick={() =>
                                cls.students?.length > 0 &&
                                openNamesModal("students", cls.students)
                              }
                            >
                              {cls.students?.length || 0}
                            </td>
                          </tr>
                        ))
                      );
                    })}
                  </tbody>
                </table>
              )}

              {activeTab === "levels" && (
                <table className="user-profile__table">
                  <thead>
                    <tr>
                      <th>Уровень</th>
                      <th>Участники</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(profile.levels || []).map((level) => (
                      <tr key={level.id}>
                        <td>{level.title}</td>
                        <td
                          className="user-profile__clickable-cell"
                          onClick={() =>
                            level.participants?.length > 0 &&
                            openNamesModal("participants", level.participants)
                          }
                        >
                          {level.participants?.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeSection === "history" && <Winners />}

        {activeSection === "users" && (
          <div className="user-profile__users">
            <header className="user-profile__header">
              <h2 className="user-profile__title">Пользователи</h2>
            </header>
            <div className="user-profile__content">
              <div className="user-profile__users-actions">
                <button
                  className="user-profile__action-btn"
                  onClick={() => setShowRegistrationModal(true)}
                >
                  Зарегистрировать пользователя
                </button>
              </div>
              <div className="user-profile__table-container">
                <table className="user-profile__table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Имя</th>
                      <th>Роль</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.role || "Не указана"}</td>
                        <td>
                          <button
                            className="user-profile__action-btn"
                            onClick={() => handleEditRole(user)}
                          >
                            Редактировать
                          </button>
                          <button
                            className="user-profile__action-btn user-profile__action-btn--danger"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === "settings" && (
          <div className="user-profile__settings">
            <header className="user-profile__header">
              <h2 className="user-profile__title">Настройки</h2>
            </header>
            <div className="user-profile__content">
              <p>Раздел настроек в разработке</p>
            </div>
          </div>
        )}
      </main>

      {showNamesModal && (
        <div className="user-profile__modal">
          <div className="user-profile__modal-content">
            <h3 className="user-profile__modal-title">
              {namesModalType === "participants"
                ? "Список участников"
                : "Список учеников"}
            </h3>
            <div className="user-profile__modal-grid-container">
              {namesList.length > 0 ? (
                <div className="user-profile__modal-grid">
                  {Array(Math.ceil(namesList.length / 20))
                    .fill()
                    .map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className="user-profile__modal-grid-column"
                      >
                        {namesList
                          .slice(colIndex * 20, (colIndex + 1) * 20)
                          .map((name, index) => (
                            <div
                              key={index}
                              className="user-profile__modal-grid-item"
                            >
                              <span className="user-profile__modal-grid-number">
                                {colIndex * 20 + index + 1}
                              </span>
                              <span className="user-profile__modal-grid-name">
                                {name}
                              </span>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="user-profile__modal-empty">Список пуст</p>
              )}
            </div>
            <div className="user-profile__modal-buttons">
              <button
                className="user-profile__action-btn"
                onClick={closeNamesModal}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegistrationModal && (
        <div className="user-profile__modal">
          <div className="user-profile__modal-content">
            <h3 className="user-profile__modal-title">
              Регистрация пользователя
            </h3>
            <Registration onSuccess={handleRegistrationSuccess} />
            <div className="user-profile__modal-buttons">
              <button
                className="user-profile__action-btn"
                onClick={() => setShowRegistrationModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditRoleModal && (
        <div className="user-profile__modal">
          <div className="user-profile__modal-content">
            <h3 className="user-profile__modal-title">
              Редактировать пользователя
            </h3>
            <div className="user-profile__modal-form">
              <label className="user-profile__modal-label">
                Имя пользователя:
              </label>
              <input
                type="text"
                className="user-profile__modal-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <label className="user-profile__modal-label">Роль:</label>
              <select
                className="user-profile__modal-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="admin">Администратор</option>
                <option value="manager">Менеджер</option>
              </select>
            </div>
            <div className="user-profile__modal-buttons">
              <button
                className="user-profile__action-btn"
                onClick={handleUpdateRole}
              >
                Сохранить
              </button>
              <button
                className="user-profile__action-btn"
                onClick={() => setShowEditRoleModal(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
