import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectedPin as savePin,
  setProfile,
  selectedSchool,
  selectedLevel,
  setAllowedStudents,
} from "../../Ducks/Reducer";
import axios from "axios";
import GameOver from "./GameOver";
import { QRCodeCanvas } from "qrcode.react";

const Game = () => {
  const quiz = useSelector((state) => state.quiz || {});
  const selectedPin = useSelector((state) => state.selectedPin || 0);
  const profile = useSelector((state) => state.profile || { schools: [] });
  const dispatch = useDispatch();

  const [pin, setPin] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]); // Выбранные игроки (до 15)
  const [connectedPlayers, setConnectedPlayers] = useState([]); // Подключившиеся игроки
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [answeredPlayers, setAnsweredPlayers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [step, setStep] = useState("selectSchool");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // Функция для правильного склонения слова "балл"
  const getScoreText = (score) => {
    if (score % 10 === 1 && score % 100 !== 11) return `${score} балл`;
    if ([2, 3, 4].includes(score % 10) && ![12, 13, 14].includes(score % 100))
      return `${score} балла`;
    return `${score} баллов`;
  };

  const waitForSocketConnection = (callback) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState === WebSocket.OPEN) {
      callback();
    } else if (socket.readyState === WebSocket.CONNECTING) {
      setTimeout(() => waitForSocketConnection(callback), 100);
    } else {
      console.error("WebSocket не подключен:", socket.readyState);
    }
  };

  const generatePin = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000);
    dispatch(savePin(newPin));
    setPin(newPin);
  };

  const startGame = () => {
    if (players.length > 0) {
      setIsLive(true);
      sendQuestion(0);
    } else {
      alert("❗ Нужно хотя бы 1 игрок");
    }
  };

  const startTimer = () => {
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          showRoundResults();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendQuestion = (index) => {
    const question = questions[index];
    if (question) {
      setCurrentQuestion(index);
      setAnsweredPlayers([]);
      setShowResults(false);
      waitForSocketConnection(() => {
        socketRef.current.send(
          JSON.stringify({
            event: "new-question",
            payload: { ...question, time: 30 },
          })
        );
      });
      startTimer();
    } else {
      setGameOver(true);
      waitForSocketConnection(() => {
        socketRef.current.send(
          JSON.stringify({
            event: "game-over",
            payload: { leaderboard: leaderBoard },
          })
        );
      });
      sendWinnersToApi();
    }
  };

  const showRoundResults = () => {
    waitForSocketConnection(() => {
      socketRef.current.send(
        JSON.stringify({
          event: "question-results",
          payload: { leaderboard: leaderBoard },
        })
      );
    });
    setShowResults(true);
  };

  const handleNext = () => {
    const next = currentQuestion + 1;
    if (next < questions.length) {
      sendQuestion(next);
    } else {
      setGameOver(true);
      waitForSocketConnection(() => {
        socketRef.current.send(
          JSON.stringify({
            event: "game-over",
            payload: { leaderboard: leaderBoard },
          })
        );
      });
      sendWinnersToApi();
    }
  };

  const sendWinnersToApi = () => {
    const top3 = leaderBoard
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((player, index) => ({
        id: index + 1,
        name: player.name,
        score: player.score,
      }));

    const winnersData = {
      quiz_name: quiz.title || "Без названия",
      level:
        profile.schools
          .find((s) => s.id === selectedSchoolId)
          ?.levels.find((l) => l.id === selectedLevelId)?.title ||
        "Неизвестный уровень",
      date: new Date().toISOString(),
      winners: top3,
    };

    axios
      .post("https://rasu0101.pythonanywhere.com/winners/winners/", winnersData)
      .then((res) => console.log("Топ-3 отправлены:", res.data))
      .catch((err) => console.error("Ошибка отправки топ-3:", err));
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchoolId(school.id);
    dispatch(selectedSchool(school));
    setStep("selectLevel");
  };

  const handleLevelSelect = (level) => {
    setSelectedLevelId(level.id);
    dispatch(selectedLevel(level));

    // Автоматический выбор 15 случайных участников
    const participants = level.participants || [];
    const selectedParticipants = participants
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(15, participants.length))
      .map((name) => ({ name }));

    setPlayers(selectedParticipants);
    setLeaderBoard(
      selectedParticipants.map((player) => ({ name: player.name, score: 0 }))
    );
    setConnectedPlayers([]); // Изначально никто не подключился

    // Разрешаем доступ только выбранным игрокам
    dispatch(setAllowedStudents(selectedParticipants.map((p) => p.name)));
    waitForSocketConnection(() => {
      socketRef.current.send(
        JSON.stringify({
          event: "allowed-students",
          payload: { students: selectedParticipants.map((p) => p.name) },
        })
      );
    });

    setStep("preStart");
  };

  useEffect(() => {
    axios
      .get("https://rasu0101.pythonanywhere.com/user/user/")
      .then((res) => {
        dispatch(setProfile(res.data[0]));
      });

    if (!quiz.id) return;
    axios
      .get(`https://kwiz-clone2.onrender.com/api/quizzes/${quiz.id}/`)
      .then((res) => setQuestions(res.data.questions || []));
    generatePin();
  }, [quiz, dispatch]);

  useEffect(() => {
    if (!selectedPin) return;
    const socket = new WebSocket(
      `wss://kwiz-clone2.onrender.com/ws/quiz/${selectedPin}/`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ event: "host-join", payload: { pin: selectedPin } })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const name = data.payload && data.payload.name;

      switch (data.event) {
        case "player-joined":
          // Разрешаем подключение только выбранным игрокам
          if (name && players.find((p) => p.name === name) && !isLive) {
            setConnectedPlayers((prev) => {
              if (!prev.includes(name)) {
                return [...prev, name];
              }
              return prev;
            });
          } else if (name && !isLive) {
            console.log(`Игрок ${name} не в списке выбранных`);
            waitForSocketConnection(() => {
              socketRef.current.send(
                JSON.stringify({
                  event: "access-denied",
                  payload: { name },
                })
              );
            });
          }
          break;

        case "player-answer":
          setLeaderBoard((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.name === name);
            if (index !== -1) {
              updated[index].score += 1;
            }
            return updated;
          });
          setAnsweredPlayers((prev) => {
            if (!prev.includes(name)) {
              return [...prev, name];
            }
            return prev;
          });
          break;

        case "question-timeout":
          showRoundResults();
          break;

        default:
          break;
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      socket.close();
      clearInterval(timerRef.current);
    };
  }, [selectedPin, players, isLive]);

  const gameLink = `${window.location.origin}/?pin=${pin}`;

  return (
    <div className="game__container">
      {/* Этап выбора школы */}
      {!isLive && !gameOver && step === "selectSchool" && (
        <div className="game__select-school">
          <h2 className="game__select-title">Выберите школу</h2>
          <ul className="game__school-list">
            {profile.schools.map((school) => (
              <li key={school.id} className="game__school-item">
                <button
                  onClick={() => handleSchoolSelect(school)}
                  className="game__select-btn"
                >
                  {school.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Этап выбора уровня */}
      {!isLive && !gameOver && step === "selectLevel" && (
        <div className="game__select-level">
          <h2 className="game__select-title">Выберите уровень</h2>
          <ul className="game__level-list">
            {profile.schools
              .find((s) => s.id === selectedSchoolId)
              ?.levels.map((level) => (
                <li key={level.id} className="game__level-item">
                  <button
                    onClick={() => handleLevelSelect(level)}
                    className="game__select-btn"
                  >
                    {level.title} (Учеников: {level.participants.length})
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Этап подготовки к игре */}
      {!isLive && !gameOver && step === "preStart" && (
        <div className="game__pre-start">
          <div className="game__pin">
            <p className="game__pin-title">Kwizz PIN</p>
            <h1 className="game__pin-number">{pin}</h1>
            <QRCodeCanvas
              value={gameLink}
              size={200}
              className="game__qr-code"
            />
            <p className="game__scan-instruction">📷 Сканируйте</p>
          </div>

          <div className="game__player-list">
            <button onClick={startGame} className="game__play-btn">
              Начать
            </button>
            <div className="game__player-section">
              <p className="game__joined-notice">Выбранные игроки:</p>
              <div className="game__players-grid">
                {players.map((p, i) => (
                  <span key={i} className="game__player-name">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="game__player-section">
              <p className="game__connected-notice">Подключившиеся игроки:</p>
              {connectedPlayers.length > 0 ? (
                <div className="game__players-grid">
                  {connectedPlayers.map((name, i) => (
                    <span key={i} className="game__connected-name">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="game__no-connected">Никто ещё не подключился</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Активная игра */}
      {isLive && !gameOver && !showResults && (
        <div className="game__active">
          <h2 className="game__status-message">⏳ Игра запущена</h2>
          <p className="game__question-counter">
            Вопрос {currentQuestion + 1} из {questions.length}
          </p>
          <p className="game__timer">Осталось: {timeLeft} сек</p>
        </div>
      )}

      {/* Результаты раунда */}
      {isLive && !gameOver && showResults && (
        <div className="game__results">
          <h2 className="game-over__round-results">📊 Результаты раунда</h2>
          <table className="game-over__leaderboard">
            <thead>
              <tr>
                <th>#</th>
                <th>Игрок</th>
                <th>Очки</th>
              </tr>
            </thead>
            <tbody>
              {[...leaderBoard]
                .sort((a, b) => b.score - a.score) // Сортировка по убыванию очков
                .map((player, index) => (
                  <tr
                    key={index}
                    className={
                      index < 3
                        ? `game-over__leaderboard-row--top-${index + 1}`
                        : ""
                    }
                  >
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{getScoreText(player.score)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button
            onClick={handleNext}
            className="game-over__next-question-btn"
          >
            ➡️ Следующий вопрос
          </button>
        </div>
      )}

      {/* Конец игры */}
      {gameOver && (
        <GameOver
          leaderboard={leaderBoard}
          totalQuestions={questions.length}
        />
      )}
    </div>
  );
};

export default Game;