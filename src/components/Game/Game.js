// import React, { useEffect, useState, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   selectedPin as savePin,
//   setProfile,
//   selectedLevel,
//   setAllowedStudents,
// } from "../../Ducks/Reducer";
// import axios from "axios";
// import GameOver from "./GameOver";
// import { QRCodeCanvas } from "qrcode.react";

// const parseQuestionTokens = (question) => {
//   return question.split(/\s+/).filter((token) => token);
// };

// const Game = () => {
//   const quiz = useSelector((state) => state.quiz || {});
//   const selectedPin = useSelector((state) => state.selectedPin || 0);
//   const profile = useSelector((state) => state.profile || { levels: [] });
//   const dispatch = useDispatch();

//   const [pin, setPin] = useState(0);
//   const [isLive, setIsLive] = useState(false);
//   const [gameOver, setGameOver] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [questions, setQuestions] = useState([]);
//   const [players, setPlayers] = useState([]);
//   const [connectedPlayers, setConnectedPlayers] = useState([]);
//   const [leaderBoard, setLeaderBoard] = useState([]);
//   const [answeredPlayers, setAnsweredPlayers] = useState([]);
//   const [showResults, setShowResults] = useState(false);
//   const [step, setStep] = useState("selectLevel");
//   const [selectedLevelId, setSelectedLevelId] = useState(null);
//   const [animationSpeed, setAnimationSpeed] = useState(600);
//   const [winners, setWinners] = useState([]);
//   const [error, setError] = useState(null);
//   const [questionTokens, setQuestionTokens] = useState([]);
//   const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
//   const [isPreparation, setIsPreparation] = useState(false);

//   const socketRef = useRef(null);
//   const animationTimerRef = useRef(null);
//   const reconnectAttempts = useRef(0);

//   const getScoreText = (score) => {
//     if (score % 10 === 1 && score % 100 !== 11) return `${score} балл`;
//     if ([2, 3, 4].includes(score % 10) && ![12, 13, 14].includes(score % 100))
//       return `${score} балла`;
//     return `${score} баллов`;
//   };

//   const sendAllowedStudents = (studentsList) => {
//     const maxAttempts = 5;
//     let attempt = 0;

//     const trySend = () => {
//       if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//         socketRef.current.send(
//           JSON.stringify({
//             event: "allowed-students",
//             payload: { students: studentsList },
//           })
//         );
//       } else if (attempt < maxAttempts) {
//         attempt++;
//         setTimeout(trySend, 1000);
//       }
//     };
//     trySend();
//   };

//   const generatePin = () => {
//     const newPin = Math.floor(1000 + Math.random() * 9000);
//     dispatch(savePin(newPin));
//     setPin(newPin);
//     localStorage.setItem("gamePin", newPin);
//   };

//   const startGame = () => {
//     const storedConnectedPlayers = localStorage.getItem("gameConnectedPlayers");
//     const currentConnectedPlayers = storedConnectedPlayers
//       ? JSON.parse(storedConnectedPlayers)
//       : [];
//     setConnectedPlayers(currentConnectedPlayers);
//     if (currentConnectedPlayers.length > 0) {
//       setIsLive(true);
//       sendQuestion(0);
//     } else {
//       alert("❗ Требуется хотя бы 1 игрок");
//     }
//   };

//   const startPreparation = () => {
//     setIsPreparation(true);
//     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//       socketRef.current.send(
//         JSON.stringify({
//           event: "start-preparation",
//           payload: { duration: 5 },
//         })
//       );
//     }
//     setTimeout(() => {
//       setIsPreparation(false);
//       animateQuestion();
//     }, 5000);
//   };

//   const animateQuestion = () => {
//     clearInterval(animationTimerRef.current);
//     setCurrentTokenIndex(0);

//     animationTimerRef.current = setInterval(() => {
//       setCurrentTokenIndex((prev) => {
//         const nextIndex = prev + 1;
//         if (nextIndex >= questionTokens.length) {
//           clearInterval(animationTimerRef.current);
//           return prev;
//         }

//         if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//           socketRef.current.send(
//             JSON.stringify({
//               event: "question-token",
//               payload: {
//                 token: questionTokens[nextIndex],
//                 index: nextIndex,
//               },
//             })
//           );
//         }

//         return nextIndex;
//       });
//     }, animationSpeed);
//   };

//   const sendQuestion = (index) => {
//     const question = questions[index];
//     if (question) {
//       setCurrentQuestion(index);
//       setAnsweredPlayers([]);
//       setShowResults(false);

//       const tokens = parseQuestionTokens(question.question);
//       setQuestionTokens(tokens);
//       setCurrentTokenIndex(0);

//       if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//         socketRef.current.send(
//           JSON.stringify({
//             event: "new-question",
//             payload: {
//               ...question,
//               tokens: tokens,
//               currentTokenIndex: 0,
//             },
//           })
//         );
//       }

//       startPreparation();
//     } else {
//       setGameOver(true);
//     }
//   };

//   const showRoundResults = () => {
//     clearInterval(animationTimerRef.current);
//     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//       socketRef.current.send(
//         JSON.stringify({
//           event: "question-results",
//           payload: { leaderboard: leaderBoard },
//         })
//       );
//     }
//     setShowResults(true);
//   };

//   const handleNext = () => {
//     clearInterval(animationTimerRef.current);
//     const next = currentQuestion + 1;
//     if (next < questions.length) {
//       sendQuestion(next);
//     } else {
//       setGameOver(true);
//     }
//   };

//   const sendWinnersToApi = () => {
//     const top3 = leaderBoard.length
//       ? leaderBoard
//           .sort((a, b) => b.score - a.score)
//           .slice(0, 3)
//           .map((player, index) => ({
//             id: index + 1,
//             name: player.name,
//             score: player.score,
//           }))
//       : [{ id: 1, name: "Player1", score: 0 }];

//     setWinners(top3);

//     const winnersData = {
//       quiz_name: quiz.title || "Без названия",
//       level:
//         profile.levels.find((l) => l.id === selectedLevelId)?.title ||
//         "Неизвестный уровень",
//       date: new Date().toISOString(),
//       winners: top3,
//     };

//     axios
//       .post("https://rasu0101.pythonanywhere.com/winners/winners/", winnersData)
//       .then((res) => console.log("Game.js: Топ-3 отправлен:", res.data))
//       .catch((err) => console.error("Game.js: Ошибка отправки топ-3:", err));

//     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//       socketRef.current.send(
//         JSON.stringify({
//           event: "game-over",
//           payload: { leaderboard: leaderBoard, winners: top3 },
//         })
//       );
//     }
//   };

//   const handleLevelSelect = (level) => {
//     setSelectedLevelId(level.id);
//     dispatch(selectedLevel(level));

//     let participants = level.participants || [];
//     if (participants.length === 0) {
//       participants = ["Player1"];
//     }

//     const selectedParticipants = participants
//       .sort(() => Math.random() - 0.5)
//       .slice(0, Math.min(15, participants.length))
//       .map((name) => ({ name: name.trim().toLowerCase() }));

//     setPlayers(selectedParticipants);
//     setLeaderBoard(
//       selectedParticipants.map((player) => ({ name: player.name, score: 0 }))
//     );
//     setConnectedPlayers([]);
//     localStorage.setItem("gamePlayers", JSON.stringify(selectedParticipants));
//     localStorage.setItem("gameConnectedPlayers", JSON.stringify([]));
//     localStorage.setItem("gameAnimationSpeed", animationSpeed);

//     dispatch(setAllowedStudents(selectedParticipants.map((p) => p.name)));
//     sendAllowedStudents(selectedParticipants.map((p) => p.name));

//     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//       socketRef.current.send(
//         JSON.stringify({
//           event: "animation-speed",
//           payload: { speed: animationSpeed },
//         })
//       );
//     }

//     setStep("preStart");
//   };

//   const openSettingsTab = () => {
//     const settingsUrl = `${window.location.origin}/game-settings?pin=${pin}`;
//     window.open(settingsUrl, "_blank");
//   };

//   useEffect(() => {
//     axios
//       .get("https://rasu0101.pythonanywhere.com/user/user/")
//       .then((res) => {
//         if (res.data && res.data.length > 0) {
//           dispatch(setProfile(res.data[0]));
//         } else {
//           setError("Пользователь не найден");
//         }
//       })
//       .catch((err) => {
//         setError("Ошибка загрузки профиля: " + err.message);
//         dispatch(
//           setProfile({
//             levels: [
//               {
//                 id: 1,
//                 title: "Test Level",
//                 participants: ["Player1"],
//               },
//             ],
//           })
//         );
//       });

//     if (!quiz.id) {
//       setQuestions([
//         {
//           question: "10 +20 +20 +50",
//           answer1: "10",
//           answer2: "20",
//           answer3: "30",
//           answer4: "40",
//           correct_answer: "20",
//         },
//       ]);
//       return;
//     }
//     axios
//       .get(`https://kwiz-clone2.onrender.com/api/quizzes/${quiz.id}/`)
//       .then((res) => {
//         setQuestions(res.data.questions || []);
//       })
//       .catch((err) => {
//         setQuestions([
//           {
//             question: "10 +20 +20 +50",
//             answer1: "10",
//             answer2: "20",
//             answer3: "30",
//             answer4: "40",
//             correct_answer: "20",
//           },
//         ]);
//       });
//     generatePin();
//   }, [quiz, dispatch]);

//   useEffect(() => {
//     if (!selectedPin) {
//       return;
//     }
//     const socket = new WebSocket(`wss://bektur.onrender.com/${selectedPin}`);
//     socketRef.current = socket;

//     socket.onopen = () => {
//       reconnectAttempts.current = 0;
//       socket.send(
//         JSON.stringify({ event: "host-join", payload: { pin: selectedPin } })
//       );
//       if (players.length > 0) {
//         sendAllowedStudents(players.map((p) => p.name));
//       }
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const name =
//         data.payload && data.payload.name
//           ? data.payload.name.trim().toLowerCase()
//           : null;

//       switch (data.event) {
//         case "player-joined":
//           if (
//             name &&
//             players.find((p) => p.name.trim().toLowerCase() === name) &&
//             !isLive
//           ) {
//             setConnectedPlayers((prev) => {
//               if (!prev.some((p) => p.name === name)) {
//                 const updated = [...prev, { name }];
//                 localStorage.setItem(
//                   "gameConnectedPlayers",
//                   JSON.stringify(updated)
//                 );
//                 return updated;
//               }
//               return prev;
//             });
//           }
//           break;

//         case "player-answer":
//           setLeaderBoard((prev) => {
//             const updated = [...prev];
//             const index = updated.findIndex(
//               (p) => p.name.trim().toLowerCase() === name
//             );
//             if (index !== -1) {
//               updated[index].score += data.payload.score;
//             } else {
//               updated.push({ name, score: data.payload.score });
//             }
//             return updated;
//           });
//           setAnsweredPlayers((prev) => {
//             if (!prev.includes(name)) {
//               return [...prev, name];
//             }
//             return prev;
//           });
//           break;

//         case "question-results":
//           setShowResults(true);
//           break;

//         case "animation-speed":
//           setAnimationSpeed(data.payload.speed);
//           localStorage.setItem("gameAnimationSpeed", data.payload.speed);
//           break;

//         case "allowed-students":
//           break;

//         case "start-preparation":
//         case "question-token":
//         case "player-ready":
//           break;

//         default:
//           break;
//       }
//     };

//     socket.onerror = (error) => {
//       console.error("Game.js: Ошибка WebSocket:", error);
//     };

//     socket.onclose = () => {
//       if (reconnectAttempts.current < 5) {
//         setTimeout(() => {
//           reconnectAttempts.current += 1;
//           socketRef.current = new WebSocket(`wss://bektur.onrender.com/${selectedPin}`);
//         }, 3000);
//       }
//     };

//     const handleStorageChange = (e) => {
//       if (e.key === "gameConnectedPlayers") {
//         const updatedPlayers = e.newValue ? JSON.parse(e.newValue) : [];
//         setConnectedPlayers(updatedPlayers);
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//       clearInterval(animationTimerRef.current);
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, [selectedPin, players, isLive]);

//   useEffect(() => {
//     if (gameOver) {
//       sendWinnersToApi();
//     }
//   }, [gameOver, leaderBoard]);

//   const gameLink = `${window.location.origin}/?pin=${pin}`;

//   return (
//     <div className="game__container">
//       {error && <div className="game__error">{error}</div>}
//       {!isLive && !gameOver && step === "selectLevel" && (
//         <div className="game__select-level">
//           <h2 className="game__select-title">Выберите уровень</h2>
//           <ul className="game__level-list">
//             {(profile.levels || []).map((level) => (
//               <li key={level.id} className="game__level-item">
//                 <button
//                   onClick={() => handleLevelSelect(level)}
//                   className="game__select-btn"
//                 >
//                   {level.title} (Участников: {level.participants?.length || 0})
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//       {!isLive && !gameOver && step === "preStart" && (
//         <div className="game__pre-start">
//           <div className="game__pin">
//             <p className="game__pin-title">Kwizz PIN</p>
//             <h1 className="game__pin-number">{pin}</h1>
//             <QRCodeCanvas
//               value={gameLink}
//               size={200}
//               className="game__qr-code"
//             />
//             <p className="game__scan-instruction">📷 Сканируйте</p>
//           </div>
//           <div className="game__header">
//             <button onClick={startGame} className="game__play-btn">
//               Начать
//             </button>
//             <button onClick={openSettingsTab} className="game__settings-btn">
//               ⚙️
//             </button>
//           </div>
//         </div>
//       )}
//       {isLive && !gameOver && !showResults && (
//         <div className="game__active">
//           <h2 className="Mercer__status-message">⏳ Игра запущена</h2>
//           <p className="game__question-counter">
//             Вопрос {currentQuestion + 1} из {questions.length}
//           </p>
//           {isPreparation && <p className="game__timer">Подготовка...</p>}
//           <button
//             onClick={showRoundResults}
//             className="game__end-question-btn"
//           >
//             Завершить вопрос
//           </button>
//         </div>
//       )}
//       {isLive && !gameOver && showResults && (
//         <div className="game-over__leaderboard">
//           <h2 className="game-over__round-results">📊 Результаты раунда</h2>
//           <table className="game-over__leaderboard">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Игрок</th>
//                 <th>Очки</th>
//               </tr>
//             </thead>
//             <tbody>
//               {[...leaderBoard]
//                 .sort((a, b) => b.score - a.score)
//                 .map((player, index) => (
//                   <tr key={index} className={index < 3 ? `${index + 1}` : ""}>
//                     <td>{index + 1}</td>
//                     <td>{player.name}</td>
//                     <td>{getScoreText(player.score)}</td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//           <button onClick={handleNext} className="game-over__next-question-btn">
//             ➡️ Следующий вопрос
//           </button>
//         </div>
//       )}
//       {gameOver && (
//         <GameOver
//           leaderboard={leaderBoard}
//           totalQuestions={questions.length}
//           winners={winners}
//         />
//       )}
//     </div>
//   );
// };

// export default Game;


import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectedPin as savePin,
  setProfile,
  selectedLevel,
  setAllowedStudents,
} from "../../Ducks/Reducer";
import axios from "axios";
import GameOver from "./GameOver";
import { QRCodeCanvas } from "qrcode.react";

const parseQuestionTokens = (question) => {
  return question.split(/\s+/).filter((token) => token);
};

const Game = () => {
  const quiz = useSelector((state) => state.quiz || {});
  const selectedPin = useSelector((state) => state.selectedPin || 0);
  const profile = useSelector((state) => state.profile || { levels: [] });
  const dispatch = useDispatch();

  const [pin, setPin] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [answeredPlayers, setAnsweredPlayers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [step, setStep] = useState("selectLevel");
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(600);
  const [winners, setWinners] = useState([]);
  const [error, setError] = useState(null);
  const [questionTokens, setQuestionTokens] = useState([]);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [isPreparation, setIsPreparation] = useState(false);

  const socketRef = useRef(null);
  const animationTimerRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const getScoreText = (score) => {
    if (score % 10 === 1 && score % 100 !== 11) return `${score} балл`;
    if ([2, 3, 4].includes(score % 10) && ![12, 13, 14].includes(score % 100))
      return `${score} балла`;
    return `${score} баллов`;
  };

  const sendAllowedStudents = (studentsList) => {
    const maxAttempts = 5;
    let attempt = 0;

    const trySend = () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            event: "allowed-students",
            payload: { students: studentsList },
          })
        );
      } else if (attempt < maxAttempts) {
        attempt++;
        setTimeout(trySend, 1000);
      }
    };
    trySend();
  };

  const generatePin = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000);
    dispatch(savePin(newPin));
    setPin(newPin);
    localStorage.setItem("gamePin", newPin);
  };

  const startGame = () => {
    const storedConnectedPlayers = localStorage.getItem("gameConnectedPlayers");
    const currentConnectedPlayers = storedConnectedPlayers
      ? JSON.parse(storedConnectedPlayers)
      : [];
    setConnectedPlayers(currentConnectedPlayers);
    if (currentConnectedPlayers.length > 0) {
      setIsLive(true);
      sendQuestion(0);
    } else {
      alert("❗ Требуется хотя бы 1 игрок");
    }
  };

  const startPreparation = () => {
    setIsPreparation(true);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "start-preparation",
          payload: { duration: 5 },
        })
      );
    }
    setTimeout(() => {
      setIsPreparation(false);
      animateQuestion();
    }, 5000);
  };

  const animateQuestion = () => {
    clearInterval(animationTimerRef.current);
    setCurrentTokenIndex(0);

    animationTimerRef.current = setInterval(() => {
      setCurrentTokenIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= questionTokens.length) {
          clearInterval(animationTimerRef.current);
          return prev;
        }

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              event: "question-token",
              payload: {
                token: questionTokens[nextIndex],
                index: nextIndex,
              },
            })
          );
        }

        return nextIndex;
      });
    }, animationSpeed);
  };

  const sendQuestion = (index) => {
    const question = questions[index];
    if (question) {
      setCurrentQuestion(index);
      setAnsweredPlayers([]);
      setShowResults(false);

      const tokens = parseQuestionTokens(question.question);
      setQuestionTokens(tokens);
      setCurrentTokenIndex(0);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            event: "new-question",
            payload: {
              ...question,
              tokens: tokens,
              currentTokenIndex: 0,
            },
          })
        );
      }

      startPreparation();
    } else {
      setGameOver(true);
    }
  };

  const showRoundResults = () => {
    clearInterval(animationTimerRef.current);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "question-results",
          payload: { leaderboard: leaderBoard },
        })
      );
    }
    setShowResults(true);
  };

  const handleNext = () => {
    clearInterval(animationTimerRef.current);
    const next = currentQuestion + 1;
    if (next < questions.length) {
      sendQuestion(next);
    } else {
      setGameOver(true);
    }
  };

  const sendWinnersToApi = () => {
    const top3 = leaderBoard.length
      ? leaderBoard
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((player, index) => ({
            id: index + 1,
            name: player.name,
            score: player.score,
          }))
      : [{ id: 1, name: "Player1", score: 0 }];

    setWinners(top3);

    const winnersData = {
      quiz_name: quiz.title || "Без названия",
      level:
        profile.levels.find((l) => l.id === selectedLevelId)?.title ||
        "Неизвестный уровень",
      date: new Date().toISOString(),
      winners: top3,
    };

    axios
      .post("https://rasu0101.pythonanywhere.com/winners/winners/", winnersData)
      .then((res) => console.log("Game.js: Топ-3 отправлен:", res.data))
      .catch((err) => console.error("Game.js: Ошибка отправки топ-3:", err));

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "game-over",
          payload: { leaderboard: leaderBoard, winners: top3 },
        })
      );
    }
  };

  const handleLevelSelect = (level) => {
    setSelectedLevelId(level.id);
    dispatch(selectedLevel(level));

    let participants = level.participants || [];
    if (participants.length === 0) {
      participants = ["Player1"];
    }

    const selectedParticipants = participants
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(15, participants.length))
      .map((name) => ({ name: name.trim().toLowerCase() }));

    setPlayers(selectedParticipants);
    setLeaderBoard(
      selectedParticipants.map((player) => ({ name: player.name, score: 0 }))
    );
    setConnectedPlayers([]);
    localStorage.setItem("gamePlayers", JSON.stringify(selectedParticipants));
    localStorage.setItem("gameConnectedPlayers", JSON.stringify([]));
    localStorage.setItem("gameAnimationSpeed", animationSpeed);

    dispatch(setAllowedStudents(selectedParticipants.map((p) => p.name)));
    sendAllowedStudents(selectedParticipants.map((p) => p.name));

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "animation-speed",
          payload: { speed: animationSpeed },
        })
      );
    }

    setStep("preStart");
  };

  const openSettingsTab = () => {
    const settingsUrl = `${window.location.origin}/game-settings?pin=${pin}`;
    window.open(settingsUrl, "_blank");
  };

  useEffect(() => {
    axios
      .get("https://rasu0101.pythonanywhere.com/user/user/")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          dispatch(setProfile(res.data[0]));
        } else {
          setError("Пользователь не найден");
        }
      })
      .catch((err) => {
        setError("Ошибка загрузки профиля: " + err.message);
        dispatch(
          setProfile({
            levels: [
              {
                id: 1,
                title: "Test Level",
                participants: ["Player1"],
              },
            ],
          })
        );
      });

    if (!quiz.id) {
      setQuestions([
        {
          question: "10 +20 +20 +50",
          answer1: "10",
          answer2: "20",
          answer3: "30",
          answer4: "40",
          correct_answer: "20",
        },
      ]);
      return;
    }
    axios
      .get(`https://kwiz-clone2.onrender.com/api/quizzes/${quiz.id}/`)
      .then((res) => {
        setQuestions(res.data.questions || []);
      })
      .catch(() => {
        setQuestions([
          {
            question: "10 +20 +20 +50",
            answer1: "10",
            answer2: "20",
            answer3: "30",
            answer4: "40",
            correct_answer: "20",
          },
        ]);
      });
    generatePin();
  }, [quiz, dispatch]);

  useEffect(() => {
    if (!selectedPin) {
      return;
    }
    const socket = new WebSocket(`wss://bektur.onrender.com/${selectedPin}`);
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttempts.current = 0;
      socket.send(
        JSON.stringify({ event: "host-join", payload: { pin: selectedPin } })
      );
      if (players.length > 0) {
        sendAllowedStudents(players.map((p) => p.name));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const name =
        data.payload && data.payload.name
          ? data.payload.name.trim().toLowerCase()
          : null;

      switch (data.event) {
        case "player-joined":
          if (
            name &&
            players.find((p) => p.name.trim().toLowerCase() === name) &&
            !isLive
          ) {
            setConnectedPlayers((prev) => {
              console.log(`Game.js: Adding player ${name} to connectedPlayers`);
              const updated = [...prev, { name }];
              localStorage.setItem(
                "gameConnectedPlayers",
                JSON.stringify(updated)
              );
              return updated;
            });
          }
          break;

        case "player-answer":
          setLeaderBoard((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
              (p) => p.name.trim().toLowerCase() === name
            );
            if (index !== -1) {
              updated[index].score += data.payload.score;
            } else {
              updated.push({ name, score: data.payload.score });
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

        case "question-results":
          setShowResults(true);
          break;

        case "animation-speed":
          setAnimationSpeed(data.payload.speed);
          localStorage.setItem("gameAnimationSpeed", data.payload.speed);
          break;

        default:
          break;
      }
    };

    socket.onerror = (error) => {
      console.error("Game.js: Ошибка WebSocket:", error);
    };

    socket.onclose = () => {
      if (reconnectAttempts.current < 5) {
        setTimeout(() => {
          reconnectAttempts.current += 1;
          socketRef.current = new WebSocket(`wss://bektur.onrender.com/${selectedPin}`);
        }, 3000);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "gameConnectedPlayers") {
        const updatedPlayers = e.newValue ? JSON.parse(e.newValue) : [];
        setConnectedPlayers(updatedPlayers);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearInterval(animationTimerRef.current);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [selectedPin, players, isLive]);

  useEffect(() => {
    if (gameOver) {
      sendWinnersToApi();
    }
  }, [gameOver, leaderBoard]);

  const gameLink = `${window.location.origin}/?pin=${pin}`;

  return (
    <div className="game__container">
      {error && <div className="game__error">{error}</div>}
      {!isLive && !gameOver && step === "selectLevel" && (
        <div className="game__select-level">
          <h2 className="game__select-title">Выберите уровень</h2>
          <ul className="game__level-list">
            {(profile.levels || []).map((level) => (
              <li key={level.id} className="game__level-item">
                <button
                  onClick={() => handleLevelSelect(level)}
                  className="game__select-btn"
                >
                  {level.title} (Участников: {level.participants?.length || 0})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
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
          <div className="game__header">
            <button onClick={startGame} className="game__play-btn">
              Начать
            </button>
            <button onClick={openSettingsTab} className="game__settings-btn">
              ⚙️
            </button>
          </div>
        </div>
      )}
      {isLive && !gameOver && !showResults && (
        <div className="game__active">
          <h2 className="Mercer__status-message">⏳ Игра запущена</h2>
          <p className="game__question-counter">
            Вопрос {currentQuestion + 1} из {questions.length}
          </p>
          {isPreparation && <p className="game__timer">Подготовка...</p>}
          <button
            onClick={showRoundResults}
            className="game__end-question-btn"
          >
            Завершить вопрос
          </button>
        </div>
      )}
      {isLive && !gameOver && showResults && (
        <div className="game-over__leaderboard">
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
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <tr key={index} className={index < 3 ? `${index + 1}` : ""}>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{getScoreText(player.score)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button onClick={handleNext} className="game-over__next-question-btn">
            ➡️ Следующий вопрос
          </button>
        </div>
      )}
      {gameOver && (
        <GameOver
          leaderboard={leaderBoard}
          totalQuestions={questions.length}
          winners={winners}
        />
      )}
    </div>
  );
};

export default Game;

