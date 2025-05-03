import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SchoolManagement = () => {
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    avatar: "",
    schools: [],
    levels: [],
  });
  const [activeTab, setActiveTab] = useState("view");
  const [modalType, setModalType] = useState(null);
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
  const [editSchool, setEditSchool] = useState(null);
  const [editClass, setEditClass] = useState(null);
  const [editLevel, setEditLevel] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [editParticipant, setEditParticipant] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("Все школы");
  const [showNamesModal, setShowNamesModal] = useState(false);
  const [namesModalType, setNamesModalType] = useState(null);
  const [namesList, setNamesList] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("schools");

  const navigate = useNavigate();

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
        } else {
          setError("Пользователь не найден");
        }
      })
      .catch((err) => {
        setError("Ошибка загрузки профиля: " + err.message);
        console.error("Error fetching profile:", err);
      });
  }, []);

  const updateProfile = async (updatedProfile) => {
    try {
      const response = await axios.put(
        `https://rasu0101.pythonanywhere.com/user/user/${profile.id}/`,
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError("Ошибка обновления профиля: " + err.message);
      console.error("Error updating profile:", err);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setCurrentSchoolId(null);
    setCurrentClassId(null);
    setCurrentLevelId(null);
    setNewSchoolName("");
    setNewClassName("");
    setNewStudentName("");
    setNewLevelTitle("");
    setNewParticipantName("");
    setEditSchool(null);
    setEditClass(null);
    setEditLevel(null);
    setEditStudent(null);
    setEditParticipant(null);
    setDeleteType(null);
    setSelectedStudent(null);
    setSelectedParticipant(null);
    setError(null);
  };

  const closeModal = () => {
    setModalType(null);
    setCurrentSchoolId(null);
    setCurrentClassId(null);
    setCurrentLevelId(null);
    setDeleteType(null);
    setSelectedStudent(null);
    setSelectedParticipant(null);
    setEditSchool(null);
    setEditClass(null);
    setEditLevel(null);
    setEditStudent(null);
    setEditParticipant(null);
    setError(null);
  };

  const handleAdd = async () => {
    if (!profile.id) {
      setError("Пользователь не загружен");
      return;
    }

    let updatedProfile = { ...profile };
    const normalizedInput = (value) => value.trim().toLowerCase();

    if (modalType === "school" && newSchoolName.trim()) {
      const schoolExists = profile.schools.some(
        (s) => normalizedInput(s.name) === normalizedInput(newSchoolName)
      );
      if (schoolExists) {
        setError("Школа с таким названием уже существует");
        return;
      }
      updatedProfile = {
        ...profile,
        schools: [
          ...(profile.schools || []),
          { id: Date.now(), name: newSchoolName, classes: [] },
        ],
      };
      await updateProfile(updatedProfile);
      closeModal();
    } else if (
      modalType === "class" &&
      newClassName.trim() &&
      currentSchoolId
    ) {
      const school = profile.schools.find(
        (s) => s.id === parseInt(currentSchoolId)
      );
      const classExists = school?.classes.some(
        (c) => normalizedInput(c.name) === normalizedInput(newClassName)
      );
      if (classExists) {
        setError("Класс с таким названием уже существует в этой школе");
        return;
      }
      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).map((s) =>
          s.id === parseInt(currentSchoolId)
            ? {
                ...s,
                classes: [
                  ...(s.classes || []),
                  { id: Date.now(), name: newClassName, students: [] },
                ],
              }
            : s
        ),
      };
      await updateProfile(updatedProfile);
      closeModal();
    } else if (
      modalType === "student" &&
      newStudentName.trim() &&
      currentSchoolId &&
      currentClassId
    ) {
      const school = profile.schools.find(
        (s) => s.id === parseInt(currentSchoolId)
      );
      const classObj = school?.classes.find(
        (c) => c.id === parseInt(currentClassId)
      );
      const newStudents = newStudentName
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name);

      const duplicates = newStudents.filter((name) =>
        classObj?.students.some(
          (stu) => normalizedInput(stu) === normalizedInput(name)
        )
      );
      if (duplicates.length > 0) {
        setError(`Следующие ученики уже существуют: ${duplicates.join(", ")}`);
        return;
      }

      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).map((s) =>
          s.id === parseInt(currentSchoolId)
            ? {
                ...s,
                classes: (s.classes || []).map((c) =>
                  c.id === parseInt(currentClassId)
                    ? {
                        ...c,
                        students: [...(c.students || []), ...newStudents],
                      }
                    : c
                ),
              }
            : s
        ),
      };
      await updateProfile(updatedProfile);
      setNewStudentName("");
      setError(null);
    } else if (modalType === "level" && newLevelTitle.trim()) {
      const levelExists = profile.levels.some(
        (l) => normalizedInput(l.title) === normalizedInput(newLevelTitle)
      );
      if (levelExists) {
        setError("Уровень с таким названием уже существует");
        return;
      }
      updatedProfile = {
        ...profile,
        levels: [
          ...(profile.levels || []),
          { id: Date.now(), title: newLevelTitle, participants: [] },
        ],
      };
      await updateProfile(updatedProfile);
      closeModal();
    } else if (
      modalType === "participant" &&
      newParticipantName.trim() &&
      currentLevelId
    ) {
      const level = profile.schools.find(
        (l) => l.id === parseInt(currentLevelId)
      );
      const newParticipants = newParticipantName
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name);

      const duplicates = newParticipants.filter((name) =>
        level?.participants.some(
          (p) => normalizedInput(p) === normalizedInput(name)
        )
      );
      if (duplicates.length > 0) {
        setError(
          `Следующие участники уже существуют: ${duplicates.join(", ")}`
        );
        return;
      }

      updatedProfile = {
        ...profile,
        levels: (profile.levels || []).map((l) =>
          l.id === parseInt(currentLevelId)
            ? {
                ...l,
                participants: [...(l.participants || []), ...newParticipants],
              }
            : l
        ),
      };
      await updateProfile(updatedProfile);
      setNewParticipantName("");
      setError(null);
    } else {
      setError("Заполните все обязательные поля");
      return;
    }
  };

  const handleEdit = async () => {
    if (!profile.id) {
      setError("Пользователь не загружен");
      return;
    }

    let updatedProfile = { ...profile };
    if (modalType === "school" && editSchool && newSchoolName.trim()) {
      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).map((s) =>
          s.id === editSchool.id ? { ...s, name: newSchoolName } : s
        ),
      };
    } else if (
      modalType === "class" &&
      editClass &&
      newClassName.trim() &&
      currentSchoolId
    ) {
      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).map((s) =>
          s.id === parseInt(currentSchoolId)
            ? {
                ...s,
                classes: (s.classes || []).map((c) =>
                  c.id === editClass.id ? { ...c, name: newClassName } : c
                ),
              }
            : s
        ),
      };
    } else if (modalType === "level" && editLevel && newLevelTitle.trim()) {
      updatedProfile = {
        ...profile,
        levels: (profile.levels || []).map((l) =>
          l.id === editLevel.id ? { ...l, title: newLevelTitle } : l
        ),
      };
    } else if (
      modalType === "student" &&
      editStudent &&
      newStudentName.trim() &&
      currentSchoolId &&
      currentClassId
    ) {
      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).map((s) =>
          s.id === parseInt(currentSchoolId)
            ? {
                ...s,
                classes: (s.classes || []).map((c) =>
                  c.id === parseInt(currentClassId)
                    ? {
                        ...c,
                        students: (c.students || []).map((stu) =>
                          stu === editStudent ? newStudentName : stu
                        ),
                      }
                    : c
                ),
              }
            : s
        ),
      };
    } else if (
      modalType === "participant" &&
      editParticipant &&
      newParticipantName.trim() &&
      currentLevelId
    ) {
      updatedProfile = {
        ...profile,
        levels: (profile.levels || []).map((l) =>
          l.id === parseInt(currentLevelId)
            ? {
                ...l,
                participants: (l.participants || []).map((p) =>
                  p === editParticipant ? newParticipantName : p
                ),
              }
            : l
        ),
      };
    } else {
      setError("Заполните все обязательные поля");
      return;
    }

    await updateProfile(updatedProfile);
    closeModal();
  };

  const handleDelete = async (type) => {
    if (!profile.id) {
      setError("Пользователь не загружен");
      return;
    }

    let updatedProfile = { ...profile };
    if (type === "school" && currentSchoolId) {
      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).filter(
          (s) => s.id !== parseInt(currentSchoolId)
        ),
      };
    } else if (type === "class" && currentSchoolId && currentClassId) {
      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).map((s) =>
          s.id === parseInt(currentSchoolId)
            ? {
                ...s,
                classes: (s.classes || []).filter(
                  (c) => c.id !== parseInt(currentClassId)
                ),
              }
            : s
        ),
      };
    } else if (type === "level" && currentLevelId) {
      updatedProfile = {
        ...profile,
        levels: (profile.levels || []).filter(
          (l) => l.id !== parseInt(currentLevelId)
        ),
      };
    } else if (
      type === "student" &&
      selectedStudent &&
      currentSchoolId &&
      currentClassId
    ) {
      updatedProfile = {
        ...profile,
        schools: (profile.schools || []).map((s) =>
          s.id === parseInt(currentSchoolId)
            ? {
                ...s,
                classes: (s.classes || []).map((c) =>
                  c.id === parseInt(currentClassId)
                    ? {
                        ...c,
                        students: (c.students || []).filter(
                          (stu) => stu !== selectedStudent
                        ),
                      }
                    : c
                ),
              }
            : s
        ),
      };
    } else if (
      type === "participant" &&
      selectedParticipant &&
      currentLevelId
    ) {
      updatedProfile = {
        ...profile,
        levels: (profile.levels || []).map((l) =>
          l.id === parseInt(currentLevelId)
            ? {
                ...l,
                participants: (l.participants || []).filter(
                  (p) => p !== selectedParticipant
                ),
              }
            : l
        ),
      };
    } else {
      setError("Выберите объект для удаления");
      return;
    }

    await updateProfile(updatedProfile);
    closeModal();
  };

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

  const filteredSchools =
    selectedSchoolFilter === "Все школы"
      ? profile.schools || []
      : (profile.schools || []).map((school) =>
          school.name === selectedSchoolFilter ? school : null
        );

  return (
    <div className="school-management__container">
      {error && <div className="user-profile__error">{error}</div>}
      <header className="school-management__header">
        <h2 className="school-management__title">Управление школами</h2>
        <button
          className="school-management__action-btn"
          onClick={() => navigate("/admin")}
        >
          Назад
        </button>
      </header>
      <div className="school-management__tabs">
        <button
          className={`school-management__tab ${
            activeTab === "view" ? "school-management__tab--active" : ""
          }`}
          onClick={() => setActiveTab("view")}
        >
          Просмотр
        </button>
        <button
          className={`school-management__tab ${
            activeTab === "add" ? "school-management__tab--active" : ""
          }`}
          onClick={() => setActiveTab("add")}
        >
          Добавить
        </button>
        <button
          className={`school-management__tab ${
            activeTab === "edit" ? "school-management__tab--active" : ""
          }`}
          onClick={() => setActiveTab("edit")}
        >
          Изменить
        </button>
        <button
          className={`school-management__tab ${
            activeTab === "delete" ? "school-management__tab--active" : ""
          }`}
          onClick={() => setActiveTab("delete")}
        >
          Удалить
        </button>
      </div>

      {activeTab === "view" && (
        <>
          <header className="user-profile__header">
            <h2 className="user-profile__title">Данные</h2>
          </header>

          <div className="user-profile__tabs">
            <button
              className={`user-profile__tab ${
                activeSubTab === "schools" ? "user-profile__tab--active" : ""
              }`}
              onClick={() => setActiveSubTab("schools")}
            >
              Школы
            </button>
            <button
              className={`user-profile__tab ${
                activeSubTab === "levels" ? "user-profile__tab--active" : ""
              }`}
              onClick={() => setActiveSubTab("levels")}
            >
              Уровни
            </button>
            <div className="user-profile__filters">
              <button
                className="user-profile__action-btn"
                onClick={() => navigate("/host")}
              >
                🎮 Играть
              </button>
            </div>
          </div>

          <div className="user-profile__content">
            {activeSubTab === "schools" && (
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

            {activeSubTab === "levels" && (
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

      {activeTab === "add" && (
        <div className="school-management__content">
          <button
            className="school-management__action-btn"
            onClick={() => openModal("school")}
          >
            Добавить школу
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("level")}
          >
            Добавить уровень
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("class")}
          >
            Добавить класс
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("student")}
          >
            Добавить ученика
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("participant")}
          >
            Добавить участника
          </button>
        </div>
      )}

      {activeTab === "edit" && (
        <div className="school-management__content">
          <button
            className="school-management__action-btn"
            onClick={() => openModal("school")}
          >
            Изменить школу
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("level")}
          >
            Изменить уровень
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("class")}
          >
            Изменить класс
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("student")}
          >
            Изменить ученика
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("participant")}
          >
            Изменить участника
          </button>
        </div>
      )}

      {activeTab === "delete" && (
        <div className="school-management__content">
          <button
            className="school-management__action-btn"
            onClick={() => openModal("school")}
          >
            Удалить школу
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("level")}
          >
            Удалить уровень
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("class")}
          >
            Удалить класс
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("student")}
          >
            Удалить ученика
          </button>
          <button
            className="school-management__action-btn"
            onClick={() => openModal("participant")}
          >
            Удалить участника
          </button>
        </div>
      )}

      {modalType && (
        <div className="school-management__modal">
          <div className="school-management__modal-content">
            <h3 className="school-management__modal-title">
              {activeTab === "add" &&
                modalType === "school" &&
                "Добавить школу"}
              {activeTab === "add" && modalType === "class" && "Добавить класс"}
              {activeTab === "add" &&
                modalType === "student" &&
                "Добавить ученика"}
              {activeTab === "add" &&
                modalType === "level" &&
                "Добавить уровень"}
              {activeTab === "add" &&
                modalType === "participant" &&
                "Добавить участника"}
              {activeTab === "edit" &&
                modalType === "school" &&
                "Изменить школу"}
              {activeTab === "edit" &&
                modalType === "class" &&
                "Изменить класс"}
              {activeTab === "edit" &&
                modalType === "student" &&
                "Изменить ученика"}
              {activeTab === "edit" &&
                modalType === "level" &&
                "Изменить уровень"}
              {activeTab === "edit" &&
                modalType === "participant" &&
                "Изменить участника"}
              {activeTab === "delete" &&
                modalType === "school" &&
                "Удалить школу"}
              {activeTab === "delete" &&
                modalType === "class" &&
                "Удалить класс"}
              {activeTab === "delete" &&
                modalType === "student" &&
                "Удалить ученика"}
              {activeTab === "delete" &&
                modalType === "level" &&
                "Удалить уровень"}
              {activeTab === "delete" &&
                modalType === "participant" &&
                "Удалить участника"}
            </h3>

            {(activeTab === "add" && modalType === "class") ||
            (activeTab === "add" && modalType === "student") ||
            (activeTab === "delete" &&
              (modalType === "class" || modalType === "student")) ? (
              <select
                className="school-management__modal-input"
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
            ) : null}

            {activeTab === "edit" &&
              (modalType === "class" || modalType === "student") && (
                <select
                  className="school-management__modal-input"
                  value={currentSchoolId || ""}
                  onChange={(e) => {
                    setCurrentSchoolId(e.target.value);
                    setEditClass(null);
                    setEditStudent(null);
                    setNewClassName("");
                    setNewStudentName("");
                  }}
                >
                  <option value="">Выберите школу</option>
                  {(profile.schools || []).map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              )}

            {((activeTab === "add" && modalType === "student") ||
              (activeTab === "delete" &&
                (modalType === "student" || modalType === "class"))) &&
              currentSchoolId && (
                <select
                  className="school-management__modal-input"
                  value={currentClassId || ""}
                  onChange={(e) => setCurrentClassId(e.target.value)}
                >
                  <option value="">Выберите класс</option>
                  {(
                    profile.schools?.find(
                      (s) => s.id === parseInt(currentSchoolId)
                    )?.classes || []
                  ).map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              )}

            {activeTab === "edit" &&
              modalType === "class" &&
              currentSchoolId && (
                <select
                  className="school-management__modal-input"
                  value={editClass?.id || ""}
                  onChange={(e) => {
                    const cls = profile.schools
                      .find((s) => s.id === parseInt(currentSchoolId))
                      ?.classes.find((c) => c.id === parseInt(e.target.value));
                    setEditClass(cls);
                    setNewClassName(cls?.name || "");
                  }}
                >
                  <option value="">Выберите класс</option>
                  {(
                    profile.schools?.find(
                      (s) => s.id === parseInt(currentSchoolId)
                    )?.classes || []
                  ).map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              )}

            {activeTab === "edit" &&
              modalType === "student" &&
              currentSchoolId && (
                <select
                  className="school-management__modal-input"
                  value={currentClassId || ""}
                  onChange={(e) => {
                    setCurrentClassId(e.target.value);
                    setEditStudent(null);
                    setNewStudentName("");
                  }}
                >
                  <option value="">Выберите класс</option>
                  {(
                    profile.schools?.find(
                      (s) => s.id === parseInt(currentSchoolId)
                    )?.classes || []
                  ).map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              )}

            {(modalType === "participant" ||
              (activeTab !== "add" && modalType === "level")) && (
              <select
                className="school-management__modal-input"
                value={currentLevelId || ""}
                onChange={(e) => {
                  setCurrentLevelId(e.target.value);
                  if (activeTab === "edit" && modalType === "level") {
                    const level = profile.levels.find(
                      (l) => l.id === parseInt(e.target.value)
                    );
                    setEditLevel(level);
                    setNewLevelTitle(level?.title || "");
                  }
                }}
              >
                <option value="">Выберите уровень</option>
                {(profile.levels || []).map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.title}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "edit" && modalType === "school" && (
              <select
                className="school-management__modal-input"
                value={editSchool?.id || ""}
                onChange={(e) => {
                  const school = profile.schools.find(
                    (s) => s.id === parseInt(e.target.value)
                  );
                  setEditSchool(school);
                  setNewSchoolName(school?.name || "");
                }}
              >
                <option value="">Выберите школу</option>
                {(profile.schools || []).map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "edit" &&
              modalType === "student" &&
              currentSchoolId &&
              currentClassId && (
                <select
                  className="school-management__modal-input"
                  value={editStudent || ""}
                  onChange={(e) => {
                    setEditStudent(e.target.value);
                    setNewStudentName(e.target.value);
                  }}
                >
                  <option value="">Выберите ученика</option>
                  {(
                    profile.schools
                      ?.find((s) => s.id === parseInt(currentSchoolId))
                      ?.classes?.find((c) => c.id === parseInt(currentClassId))
                      ?.students || []
                  ).map((student, index) => (
                    <option key={index} value={student}>
                      {student}
                    </option>
                  ))}
                </select>
              )}

            {activeTab === "edit" &&
              modalType === "participant" &&
              currentLevelId && (
                <select
                  className="school-management__modal-input"
                  value={editParticipant || ""}
                  onChange={(e) => {
                    setEditParticipant(e.target.value);
                    setNewParticipantName(e.target.value);
                  }}
                >
                  <option value="">Выберите участника</option>
                  {(
                    profile.levels?.find(
                      (l) => l.id === parseInt(currentLevelId)
                    )?.participants || []
                  ).map((participant, index) => (
                    <option key={index} value={participant}>
                      {participant}
                    </option>
                  ))}
                </select>
              )}

            {activeTab === "delete" && modalType === "school" && (
              <select
                className="school-management__modal-input"
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

            {activeTab === "delete" &&
              modalType === "student" &&
              currentSchoolId &&
              currentClassId && (
                <select
                  className="school-management__modal-input"
                  value={selectedStudent || ""}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Выберите ученика</option>
                  {(
                    profile.schools
                      ?.find((s) => s.id === parseInt(currentSchoolId))
                      ?.classes?.find((c) => c.id === parseInt(currentClassId))
                      ?.students || []
                  ).map((student, index) => (
                    <option key={index} value={student}>
                      {student}
                    </option>
                  ))}
                </select>
              )}

            {activeTab === "delete" &&
              modalType === "participant" &&
              currentLevelId && (
                <select
                  className="school-management__modal-input"
                  value={selectedParticipant || ""}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                >
                  <option value="">Выберите участника</option>
                  {(
                    profile.levels?.find(
                      (l) => l.id === parseInt(currentLevelId)
                    )?.participants || []
                  ).map((participant, index) => (
                    <option key={index} value={participant}>
                      {participant}
                    </option>
                  ))}
                </select>
              )}

            {(activeTab === "add" || activeTab === "edit") && (
              <input
                className="school-management__modal-input"
                value={
                  modalType === "school"
                    ? newSchoolName
                    : modalType === "class"
                    ? newClassName
                    : modalType === "student"
                    ? newStudentName
                    : modalType === "level"
                    ? newLevelTitle
                    : newParticipantName
                }
                onChange={(e) => {
                  if (modalType === "school") setNewSchoolName(e.target.value);
                  else if (modalType === "class")
                    setNewClassName(e.target.value);
                  else if (modalType === "student")
                    setNewStudentName(e.target.value);
                  else if (modalType === "level")
                    setNewLevelTitle(e.target.value);
                  else setNewParticipantName(e.target.value);
                }}
                placeholder={
                  modalType === "school"
                    ? "Название школы"
                    : modalType === "class"
                    ? "Название класса"
                    : modalType === "student"
                    ? "Имена через запятую: Иван, Мария"
                    : modalType === "level"
                    ? "Название уровня"
                    : "Имена через запятую: Иван, Мария"
                }
              />
            )}

            <div className="school-management__modal-buttons">
              {activeTab === "add" && (
                <>
                  {modalType === "student" || modalType === "participant" ? (
                    <button
                      className="school-management__action-btn"
                      onClick={handleAdd}
                    >
                      Добавить и продолжить
                    </button>
                  ) : (
                    <button
                      className="school-management__action-btn"
                      onClick={handleAdd}
                    >
                      Добавить
                    </button>
                  )}
                </>
              )}
              {activeTab === "edit" && (
                <button
                  className="school-management__action-btn"
                  onClick={handleEdit}
                >
                  Изменить
                </button>
              )}
              {activeTab === "delete" && (
                <button
                  className="school-management__action-btn school-management__action-btn--danger"
                  onClick={() => handleDelete(modalType)}
                >
                  Удалить
                </button>
              )}
              <button
                className="school-management__action-btn school-management__action-btn--danger"
                onClick={closeModal}
              >
                {modalType === "student" || modalType === "participant"
                  ? "Готово"
                  : "Отмена"}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default SchoolManagement;
