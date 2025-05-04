import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  handleNickname,
  selectedPin,
  setAllowedStudents,
} from "../../Ducks/Reducer";
import Kwizz from "../../Assests/логотип123.png";
import axios from "axios";

const Landing = () => {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [allowedStudents, setAllowedStudentsLocal] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const pinInputRef = useRef(null);
  const nicknameInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 1 && pinInputRef.current) {
      pinInputRef.current.focus();
    } else if (step === 2 && nicknameInputRef.current) {
      nicknameInputRef.current.focus();
    }
  }, [step]);

  const handlePinSubmit = () => {
    const trimmedPin = pin.trim();
    if (!trimmedPin || isNaN(Number(trimmedPin)) || trimmedPin.length < 4) {
      setError("Введите корректный PIN (4 цифры).");
      setPin("");
      return;
    }
    setIsLoading(true);
    setError(null);

    axios
      .get("https://rasu0101.pythonanywhere.com/user/user/")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const students = res.data[0].levels.flatMap(
            (level) => level.participants || []
          );
          console.log("Landing.js: Загруженные участники:", students);
          if (students.length === 0) {
            setError("Список участников пуст. Обратитесь к организатору.");
            setAllowedStudentsLocal(["2", "бакытбек", "дима"]);
            dispatch(setAllowedStudents(["2", "бакытбек", "дима"]));
          } else {
            setAllowedStudentsLocal(students);
            dispatch(setAllowedStudents(students));
            dispatch(selectedPin(Number(trimmedPin)));
            setStep(2);
          }
        } else {
          setError("Пользователь не найден. Используется тестовый список.");
          setAllowedStudentsLocal(["2", "бакытбек", "дима"]);
          dispatch(setAllowedStudents(["2", "бакытбек", "дима"]));
        }
      })
      .catch((err) => {
        console.error("Landing.js: Ошибка загрузки участников:", err);
        setError(
          "Ошибка загрузки участников. Используется тестовый список: 2, бакытбек, дима."
        );
        setAllowedStudentsLocal(["2", "бакытбек", "дима"]);
        dispatch(setAllowedStudents(["2", "бакытбек", "дима"]));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleNicknameSubmit = () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("Введите имя.");
      setNickname("");
      return;
    }

    const isNicknameAllowed = allowedStudents.some(
      (student) => student.toLowerCase() === trimmedNickname.toLowerCase()
    );

    console.log("Landing.js: Проверка никнейма:", {
      input: trimmedNickname,
      allowedStudents,
      isNicknameAllowed,
    });

    if (!isNicknameAllowed) {
      setError(
        `Никнейм "${trimmedNickname}" не в списке участников. Допустимые никнеймы: ${allowedStudents.join(
          ", "
        )}.`
      );
      setNickname("");
      return;
    }

    dispatch(handleNickname(trimmedNickname));
    navigate("/player");
  };

  const handleBack = () => {
    setStep(1);
    setNickname("");
    setError(null);
    setPin("");
    setAllowedStudentsLocal([]);
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setError(null);
  };

  return (
    <div className="quiz">
      <div className="quiz__container">
        <div className="quiz__logo">
          <img src={Kwizz} alt="Kwizz" />
        </div>
        {error && <div className="quiz__error">{error}</div>}
        {step === 1 ? (
          <>
            <input
              type="number"
              placeholder="Введите PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="quiz__input"
              ref={pinInputRef}
              disabled={isLoading}
            />
            <button
              onClick={handlePinSubmit}
              className="quiz__button"
              disabled={isLoading}
            >
              {isLoading ? "Загрузка..." : "Далее"}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="quiz__button"
              style={{ marginTop: "10px", backgroundColor: "#888" }}
            >
              Войти
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder={`Введите имя (например: ${allowedStudents[0] || "дима"})`}
              value={nickname}
              onChange={handleNicknameChange}
              className="quiz__input"
              ref={nicknameInputRef}
              list="nickname-suggestions"
            />
            <datalist id="nickname-suggestions">
              {allowedStudents.map((student, index) => (
                <option key={index} value={student} />
              ))}
            </datalist>
            <button onClick={handleNicknameSubmit} className="quiz__button">
              Играть!
            </button>
            <button
              onClick={handleBack}
              className="quiz__button"
              style={{ marginTop: "10px", backgroundColor: "#888" }}
            >
              Назад
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Landing;
