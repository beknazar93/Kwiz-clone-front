import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Winners from "./Winners";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    id: 1,
    name: "",
    avatar: "",
    schools: [],
  });
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("Все школы");
  const [showHistory, setShowHistory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNamesModal, setShowNamesModal] = useState(false); // Новое состояние для модального окна с именами
  const [modalType, setModalType] = useState(null);
  const [namesModalType, setNamesModalType] = useState(null); // Тип модального окна (participants или students)
  const [namesList, setNamesList] = useState([]); // Список имён для отображения
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newLevelTitle, setNewLevelTitle] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [currentSchoolId, setCurrentSchoolId] = useState(null);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [currentLevelId, setCurrentLevelId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("https://rasu0101.pythonanywhere.com/user/user/").then((res) => {
      setProfile(res.data[0]);
    });
  }, []);

  const updateProfile = (updatedSchools) => {
    const updated = { ...profile, schools: updatedSchools };
    setProfile(updated);
    axios.put(`https://rasu0101.pythonanywhere.com/user/user/${profile.id}/`, updated);
  };

  // Подсчёт статистики
  const totalSchools = profile.schools?.length || 0;
  const totalLevels = profile.schools?.reduce((sum, school) => sum + (school.levels?.length || 0), 0) || 0;
  const totalParticipants = profile.schools?.reduce(
    (sum, school) =>
      sum + (school.levels?.reduce((levelSum, level) => levelSum + (level.participants?.length || 0), 0) || 0),
    0
  ) || 0;

  // Фильтрация школ
  const filteredSchools = selectedSchoolFilter === "Все школы"
    ? profile.schools || []
    : (profile.schools || []).filter((school) => school.name === selectedSchoolFilter);

  const openAddModal = (type) => {
    setModalType(type);
    setCurrentSchoolId(null);
    setCurrentClassId(null);
    setCurrentLevelId(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setModalType(null);
    setNewSchoolName("");
    setNewClassName("");
    setNewStudentName("");
    setNewLevelTitle("");
    setNewParticipantName("");
    setCurrentSchoolId(null);
    setCurrentClassId(null);
    setCurrentLevelId(null);
  };

  const openDeleteModal = (schoolId, classId, levelId) => {
    setCurrentSchoolId(schoolId);
    setCurrentClassId(classId);
    setCurrentLevelId(levelId);
    setDeleteType(null);
    setSelectedStudent(null);
    setSelectedParticipant(null);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteType(null);
    setCurrentSchoolId(null);
    setCurrentClassId(null);
    setCurrentLevelId(null);
    setSelectedStudent(null);
    setSelectedParticipant(null);
  };

  // Функции для открытия и закрытия модального окна с именами
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

  const handleAdd = () => {
    if (modalType === "school" && newSchoolName.trim()) {
      const updatedSchools = [
        ...(profile.schools || []),
        { id: Date.now(), name: newSchoolName, classes: [], levels: [] },
      ];
      updateProfile(updatedSchools);
    } else if (modalType === "class" && newClassName.trim() && currentSchoolId) {
      const updatedSchools = (profile.schools || []).map((s) =>
        s.id === parseInt(currentSchoolId)
          ? { ...s, classes: [...(s.classes || []), { id: Date.now(), name: newClassName, students: [] }] }
          : s
      );
      updateProfile(updatedSchools);
    } else if (modalType === "student" && newStudentName.trim() && currentSchoolId && currentClassId) {
      const updatedSchools = (profile.schools || []).map((s) =>
        s.id === parseInt(currentSchoolId)
          ? {
              ...s,
              classes: (s.classes || []).map((c) =>
                c.id === parseInt(currentClassId)
                  ? { ...c, students: [...(c.students || []), newStudentName] }
                  : c
              ),
            }
          : s
      );
      updateProfile(updatedSchools);
    } else if (modalType === "level" && newLevelTitle.trim() && currentSchoolId) {
      const updatedSchools = (profile.schools || []).map((s) =>
        s.id === parseInt(currentSchoolId)
          ? {
              ...s,
              levels: [...(s.levels || []), { id: Date.now(), title: newLevelTitle, participants: [] }],
            }
          : s
      );
      updateProfile(updatedSchools);
    } else if (modalType === "participant" && newParticipantName.trim() && currentSchoolId && currentLevelId) {
      const updatedSchools = (profile.schools || []).map((s) =>
        s.id === parseInt(currentSchoolId)
          ? {
              ...s,
              levels: (s.levels || []).map((l) =>
                l.id === parseInt(currentLevelId)
                  ? { ...l, participants: [...(l.participants || []), newParticipantName] }
                  : l
              ),
            }
          : s
      );
      updateProfile(updatedSchools);
    }
    closeAddModal();
  };

  const handleDelete = () => {
    let updatedSchools = profile.schools || [];
    if (deleteType === "school") {
      updatedSchools = updatedSchools.filter((s) => s.id !== parseInt(currentSchoolId));
    } else if (deleteType === "class") {
      updatedSchools = updatedSchools.map((s) =>
        s.id === parseInt(currentSchoolId)
          ? {
              ...s,
              classes: (s.classes || []).filter((c) => c.id !== parseInt(currentClassId)),
            }
          : s
      );
    } else if (deleteType === "level") {
      updatedSchools = updatedSchools.map((s) =>
        s.id === parseInt(currentSchoolId)
          ? {
              ...s,
              levels: (s.levels || []).filter((l) => l.id !== parseInt(currentLevelId)),
            }
          : s
      );
    } else if (deleteType === "student" && selectedStudent) {
      updatedSchools = updatedSchools.map((s) =>
        s.id === parseInt(currentSchoolId)
          ? {
              ...s,
              classes: (s.classes || []).map((c) =>
                c.id === parseInt(currentClassId)
                  ? { ...c, students: (c.students || []).filter((stu) => stu !== selectedStudent) }
                  : c
              ),
            }
          : s
      );
    } else if (deleteType === "participant" && selectedParticipant) {
      updatedSchools = updatedSchools.map((s) =>
        s.id === parseInt(currentSchoolId)
          ? {
              ...s,
              levels: (s.levels || []).map((l) =>
                l.id === parseInt(currentLevelId)
                  ? { ...l, participants: (l.participants || []).filter((p) => p !== selectedParticipant) }
                  : l
              ),
            }
          : s
      );
    }
    updateProfile(updatedSchools);
    closeDeleteModal();
  };

  return (
    <div className="user-profile__container">
      <aside className="user-profile__sidebar">
        <h1 className="user-profile__logo">Kwizz</h1>
        <ul className="user-profile__menu">
          <li
            className={`user-profile__menu-item ${!showHistory ? "user-profile__menu-item--active" : ""}`}
            onClick={() => setShowHistory(false)}
          >
            Управление
          </li>
          <li
            className={`user-profile__menu-item ${showHistory ? "user-profile__menu-item--active" : ""}`}
            onClick={() => setShowHistory(true)}
          >
            История матчей
          </li>
          <li
            className="user-profile__menu-item"
            onClick={() => alert("Раздел 'Настройки' пока в разработке!")}
          >
            Настройки
          </li>
        </ul>
      </aside>

      <main className="user-profile__main">
        {showHistory ? (
          <Winners />
        ) : (
          <>
            <header className="user-profile__header">
              <h2 className="user-profile__title">Панель управления</h2>
              <div className="user-profile__avatar"></div>
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
                onClick={() => openAddModal("school")}
              >
                🏫 Добавить школу
              </button>
              <button
                className="user-profile__action-btn"
                onClick={() => navigate("/host")}
              >
                🎮 Играть
              </button>
            </div>

            <div className="user-profile__actions">
              <div className="user-profile__action-group">
                <button
                  className="user-profile__action-btn"
                  onClick={() => openAddModal("level")}
                >
                  📚 Добавить уровень
                </button>
                <button
                  className="user-profile__action-btn"
                  onClick={() => openAddModal("class")}
                >
                  👥 Добавить класс
                </button>
              </div>
              <button
                className="user-profile__action-btn"
                onClick={() => openAddModal("student")}
              >
                👩‍🎓 Добавить ученика
              </button>
              <button
                className="user-profile__action-btn"
                onClick={() => openAddModal("participant")}
              >
                👤 Добавить участника
              </button>
            </div>

            <table className="user-profile__table">
              <thead>
                <tr>
                  <th>Школа</th>
                  <th>Уровень</th>
                  <th>Участники</th>
                  <th>Класс</th>
                  <th>Ученики</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {(filteredSchools || []).map((school) => {
                  const levelsCount = school.levels?.length || 0;
                  const classesCount = school.classes?.length || 0;
                  const maxRows = Math.max(levelsCount, classesCount);

                  return Array.from({ length: maxRows }).map((_, rowIndex) => {
                    const level = school.levels?.[rowIndex];
                    const cls = school.classes?.[rowIndex];
                    const hasLevel = !!level;
                    const hasClass = !!cls;

                    return (
                      <tr key={`${school.id}-${rowIndex}`}>
                        {rowIndex === 0 ? (
                          <td rowSpan={maxRows}>{school.name}</td>
                        ) : null}
                        <td>{hasLevel ? level.title : "-"}</td>
                        <td
                          className="user-profile__clickable-cell"
                          onClick={() => hasLevel && level.participants?.length > 0 && openNamesModal("participants", level.participants)}
                        >
                          {hasLevel ? (level.participants?.length || 0) : "-"}
                        </td>
                        <td>{hasClass ? cls.name : "-"}</td>
                        <td
                          className="user-profile__clickable-cell"
                          onClick={() => hasClass && cls.students?.length > 0 && openNamesModal("students", cls.students)}
                        >
                          {hasClass ? (cls.students?.length || 0) : "-"}
                        </td>
                        <td>
                          {(hasLevel || hasClass) && (
                            <button
                              className="user-profile__action-btn user-profile__action-btn--danger"
                              onClick={() => openDeleteModal(school.id, cls?.id, level?.id)}
                            >
                              Действия
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </>
        )}
      </main>

      {showAddModal && (
        <div className="user-profile__modal">
          <div className="user-profile__modal-content">
            <h3 className="user-profile__modal-title">
              {modalType === "school" && "Добавить школу"}
              {modalType === "class" && "Добавить класс"}
              {modalType === "student" && "Добавить ученика"}
              {modalType === "level" && "Добавить уровень"}
              {modalType === "participant" && "Добавить участника"}
            </h3>

            {(modalType === "class" || modalType === "student" || modalType === "level" || modalType === "participant") && (
              <select
                className="user-profile__modal-input"
                value={currentSchoolId || ""}
                onChange={(e) => setCurrentSchoolId(e.target.value)}
              >
                <option value="">Выберите школу</option>
                {(profile.schools || []).map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            )}

            {modalType === "student" && currentSchoolId && (
              <select
                className="user-profile__modal-input"
                value={currentClassId || ""}
                onChange={(e) => setCurrentClassId(e.target.value)}
              >
                <option value="">Выберите класс</option>
                {(profile.schools?.find((s) => s.id === parseInt(currentSchoolId))?.classes || []).map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}

            {modalType === "participant" && currentSchoolId && (
              <select
                className="user-profile__modal-input"
                value={currentLevelId || ""}
                onChange={(e) => setCurrentLevelId(e.target.value)}
              >
                <option value="">Выберите уровень</option>
                {(profile.schools?.find((s) => s.id === parseInt(currentSchoolId))?.levels || []).map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.title}
                  </option>
                ))}
              </select>
            )}

            <input
              className="user-profile__modal-input"
              value={
                modalType === "school" ? newSchoolName :
                modalType === "class" ? newClassName :
                modalType === "student" ? newStudentName :
                modalType === "level" ? newLevelTitle :
                newParticipantName
              }
              onChange={(e) => {
                if (modalType === "school") setNewSchoolName(e.target.value);
                else if (modalType === "class") setNewClassName(e.target.value);
                else if (modalType === "student") setNewStudentName(e.target.value);
                else if (modalType === "level") setNewLevelTitle(e.target.value);
                else setNewParticipantName(e.target.value);
              }}
              placeholder={
                modalType === "school" ? "Название школы" :
                modalType === "class" ? "Название класса" :
                modalType === "student" ? "Имя ученика" :
                modalType === "level" ? "Название уровня" :
                "Имя участника"
              }
            />
            <div className="user-profile__modal-buttons">
              <button className="user-profile__action-btn" onClick={handleAdd}>
                Добавить
              </button>
              <button className="user-profile__action-btn user-profile__action-btn--danger" onClick={closeAddModal}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="user-profile__modal">
          <div className="user-profile__modal-content">
            <h3 className="user-profile__modal-title">Что вы хотите удалить?</h3>
            <select
              className="user-profile__modal-input"
              value={deleteType || ""}
              onChange={(e) => setDeleteType(e.target.value)}
            >
              <option value="">Выберите действие</option>
              <option value="school">Удалить школу</option>
              <option value="level">Удалить уровень</option>
              <option value="class">Удалить класс</option>
              <option value="student">Удалить ученика</option>
              <option value="participant">Удалить участника</option>
            </select>

            {deleteType === "student" && currentSchoolId && currentClassId && (
              <select
                className="user-profile__modal-input"
                value={selectedStudent || ""}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Выберите ученика</option>
                {(profile.schools?.find((s) => s.id === parseInt(currentSchoolId))?.classes?.find((c) => c.id === parseInt(currentClassId))?.students || []).map((student, index) => (
                  <option key={index} value={student}>
                    {student}
                  </option>
                ))}
              </select>
            )}

            {deleteType === "participant" && currentSchoolId && currentLevelId && (
              <select
                className="user-profile__modal-input"
                value={selectedParticipant || ""}
                onChange={(e) => setSelectedParticipant(e.target.value)}
              >
                <option value="">Выберите участника</option>
                {(profile.schools?.find((s) => s.id === parseInt(currentSchoolId))?.levels?.find((l) => l.id === parseInt(currentLevelId))?.participants || []).map((participant, index) => (
                  <option key={index} value={participant}>
                    {participant}
                  </option>
                ))}
              </select>
            )}

            <div className="user-profile__modal-buttons">
              <button className="user-profile__action-btn user-profile__action-btn--danger" onClick={handleDelete}>
                Удалить
              </button>
              <button className="user-profile__action-btn" onClick={closeDeleteModal}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showNamesModal && (
        <div className="user-profile__modal">
          <div className="user-profile__modal-content">
            <h3 className="user-profile__modal-title">
              {namesModalType === "participants" ? "Список участников" : "Список учеников"}
            </h3>
            <div className="user-profile__names-modal-list">
              {namesList.length > 0 ? (
                namesList.map((name, index) => (
                  <span key={index} className="user-profile__name-item">
                    {name}
                  </span>
                ))
              ) : (
                <p className="user-profile__no-names">Список пуст</p>
              )}
            </div>
            <div className="user-profile__modal-buttons">
              <button className="user-profile__action-btn" onClick={closeNamesModal}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;