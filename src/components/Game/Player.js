// import React, { useEffect, useRef, useState } from "react";
// import { useSelector } from "react-redux";
// import PlayerQuestions from "./PlayerQuestions";
// import GameOver from "./GameOver";

// const Player = () => {
//   const selectedPin = useSelector((state) => state.selectedPin);
//   const nickname = useSelector((state) => state.nickname);
//   const [currentQuestion, setCurrentQuestion] = useState(null);
//   const [gameEnded, setGameEnded] = useState(false);
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [disabled, setDisabled] = useState(false);
//   const [showOptions, setShowOptions] = useState(false);
//   const [showResult, setShowResult] = useState(false);
//   const [waitingNext, setWaitingNext] = useState(false);
//   const [animatedDisplay, setAnimatedDisplay] = useState("");
//   const [prepareTime, setPrepareTime] = useState(null);
//   const [totalQuestions, setTotalQuestions] = useState(0);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     if (!selectedPin || !nickname) return;

//     const socket = new WebSocket(`wss://kwiz-clone2.onrender.com/ws/quiz/${selectedPin}/`);
//     socketRef.current = socket;

//     socket.onopen = () => {
//       socket.send(
//         JSON.stringify({
//           event: "player-joined",
//           payload: { name: nickname },
//         })
//       );
//     };

//     socket.onmessage = (e) => {
//       const data = JSON.parse(e.data);

//       if (data.event === "new-question") {
//         setCurrentQuestion(data.payload);
//         setDisabled(false);
//         setShowOptions(false);
//         setShowResult(false);
//         setWaitingNext(false);
//         setAnimatedDisplay("");
//         setTotalQuestions((prev) => prev + 1);
//         setIsSpeaking(false);
//         startPreparation(data.payload.question);
//       }

//       if (data.event === "game-over") {
//         setGameEnded(true);
//         setLeaderboard(data.payload.leaderboard || []);
//       }

//       if (data.event === "question-results") {
//         setLeaderboard(data.payload.leaderboard || []);
//         setShowResult(true);
//         setWaitingNext(true);
//       }
//     };

//     return () => socket.close();
//   }, [selectedPin, nickname]);

//   const startPreparation = (questionText) => {
//     let seconds = 5;
//     setPrepareTime(seconds);

//     const countdown = setInterval(() => {
//       seconds -= 1;
//       setPrepareTime(seconds);

//       if (seconds <= 0) {
//         clearInterval(countdown);
//         setPrepareTime(null);
//         animateQuestion(questionText);
//       }
//     }, 1000);
//   };

//   const animateQuestion = (text) => {
//     const parts = text.trim().split(/(?<=\s)|(?=\s)/).filter(part => part.trim());
//     let index = 0;
//     setAnimatedDisplay("");

//     const interval = setInterval(() => {
//       if (index < parts.length) {
//         const part = parts[index];
//         setAnimatedDisplay(part);

//         setTimeout(() => {
//           setAnimatedDisplay("");
//         }, 300);

//         index += 1;
//       } else {
//         clearInterval(interval);
//         setTimeout(() => setShowOptions(true), 400);
//       }
//     }, 600);
//   };

//   const speakQuestion = () => {
//     if (!currentQuestion || isSpeaking) return;
//     setIsSpeaking(true);
//     speechSynthesis.cancel();
//     const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
//     utterance.lang = "ru-RU";
//     utterance.rate = 1.5;
//     utterance.pitch = 1;
//     utterance.onend = () => setIsSpeaking(false); // Сбрасываем состояние после окончания
//     speechSynthesis.speak(utterance);
//   };

//   const submitAnswer = (chosen) => {
//     if (!currentQuestion || disabled) return;

//     const isCorrect = chosen === currentQuestion.correct_answer;

//     if (socketRef.current && socketRef.current.readyState === 1) {
//       socketRef.current.send(
//         JSON.stringify({
//           event: isCorrect ? "player-answer" : "question-timeout",
//           payload: { name: nickname, score: isCorrect ? 1 : 0 },
//         })
//       );
//     }

//     setDisabled(true);
//   };

//   const handleTimeout = () => {
//     if (socketRef.current && socketRef.current.readyState === 1) {
//       socketRef.current.send(
//         JSON.stringify({
//           event: "question-timeout",
//           payload: { name: nickname },
//         })
//       );
//     }
//     setDisabled(true);
//   };

//   return (
//     <div className="player">
//       <p className="player__info">Привет, {nickname}!</p>

//       {!gameEnded ? (
//         showResult ? (
//           <div className="player__game-results">
//             <h2 className="player__results-title">📊 Результаты раунда</h2>
//             <table className="player__leaderboard">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Игрок</th>
//                   <th>Очки</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {leaderboard.map((player, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{player.name}</td>
//                     <td>
//                       {player.score} / {totalQuestions}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {waitingNext && (
//               <p className="player__waiting">⏳ Ожидание следующего вопроса...</p>
//             )}
//           </div>
//         ) : prepareTime !== null ? (
//           <h2 className="player__prepare-text">🎬 Подготовка... {prepareTime}</h2>
//         ) : currentQuestion ? (
//           <>
//             <PlayerQuestions
//               question={animatedDisplay}
//               answer1={showOptions ? currentQuestion.answer1 : null}
//               answer2={showOptions ? currentQuestion.answer2 : null}
//               answer3={showOptions ? currentQuestion.answer3 : null}
//               answer4={showOptions ? currentQuestion.answer4 : null}
//               correct={currentQuestion.correct_answer}
//               submitAnswer={submitAnswer}
//               onTimeout={handleTimeout}
//               showOptions={showOptions}
//             />
//             {showOptions && (
//               <button
//                 className="player__speak-btn"
//                 onClick={speakQuestion}
//                 disabled={isSpeaking}
//               >
//                 {isSpeaking ? "Озвучивается..." : "Озвучка"}
//               </button>
//             )}
//           </>
//         ) : (
//           <p className="player__waiting-question">⏳ Ожидаем вопрос...</p>
//         )
//       ) : (
//         <GameOver leaderboard={leaderboard} totalQuestions={totalQuestions} />
//       )}
//     </div>
//   );
// };

// export default Player;


import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PlayerQuestions from "./PlayerQuestions";
import GameOver from "./GameOver";

const Player = () => {
  const selectedPin = useSelector((state) => state.selectedPin);
  const nickname = useSelector((state) => state.nickname);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [waitingNext, setWaitingNext] = useState(false);
  const [animatedDisplay, setAnimatedDisplay] = useState("");
  const [prepareTime, setPrepareTime] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!selectedPin || !nickname) return;

    const socket = new WebSocket(`wss://kwiz-clone2.onrender.com/ws/quiz/${selectedPin}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          event: "player-joined",
          payload: { name: nickname },
        })
      );
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.event === "new-question") {
        setCurrentQuestion(data.payload);
        setDisabled(false);
        setShowOptions(false);
        setShowResult(false);
        setWaitingNext(false);
        setAnimatedDisplay("");
        setTotalQuestions((prev) => prev + 1);
        setIsSpeaking(false);
        startPreparation(data.payload.question);
      }

      if (data.event === "game-over") {
        setGameEnded(true);
        setLeaderboard(data.payload.leaderboard || []);
      }

      if (data.event === "question-results") {
        setLeaderboard(data.payload.leaderboard || []);
        setShowResult(true);
        setWaitingNext(true);
      }

      if (data.event === "access-denied") {
        setAccessDenied(true);
      }
    };

    return () => socket.close();
  }, [selectedPin, nickname]);

  const startPreparation = (questionText) => {
    let seconds = 5;
    setPrepareTime(seconds);

    const countdown = setInterval(() => {
      seconds -= 1;
      setPrepareTime(seconds);

      if (seconds <= 0) {
        clearInterval(countdown);
        setPrepareTime(null);
        animateQuestion(questionText);
      }
    }, 1000);
  };

  const animateQuestion = (text) => {
    const parts = text.trim().split(/(?<=\s)|(?=\s)/).filter(part => part.trim());
    let index = 0;
    setAnimatedDisplay("");

    const interval = setInterval(() => {
      if (index < parts.length) {
        const part = parts[index];
        setAnimatedDisplay(part);

        setTimeout(() => {
          setAnimatedDisplay("");
        }, 300);

        index += 1;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowOptions(true), 400);
      }
    }, 600);
  };

  const speakQuestion = () => {
    if (!currentQuestion || isSpeaking) return;

    const voices = speechSynthesis.getVoices();
    const ruVoice = voices.find(voice => voice.lang === "ru-RU");
    if (!ruVoice) {
      alert("Русский голос не доступен на этом устройстве. Установите голос для русского языка в настройках.");
      return;
    }

    const parts = currentQuestion.question.trim().split(/(?<=\s)|(?=\s)/).filter(part => part.trim());
    let index = 0;

    setIsSpeaking(true);
    speechSynthesis.cancel();

    const speakInterval = setInterval(() => {
      if (index < parts.length) {
        const part = parts[index];
        const utterance = new SpeechSynthesisUtterance(part);
        utterance.lang = "ru-RU";
        utterance.rate = 1.5;
        utterance.pitch = 1;
        utterance.onerror = () => {
          console.error("Ошибка озвучки");
          setIsSpeaking(false);
          clearInterval(speakInterval);
        };
        speechSynthesis.speak(utterance);
        index += 1;
      } else {
        clearInterval(speakInterval);
        setIsSpeaking(false);
      }
    }, 400);
  };

  const submitAnswer = (chosen) => {
    if (!currentQuestion || disabled) return;

    const isCorrect = chosen === currentQuestion.correct_answer;

    if (socketRef.current && socketRef.current.readyState === 1) {
      socketRef.current.send(
        JSON.stringify({
          event: isCorrect ? "player-answer" : "question-timeout",
          payload: { name: nickname, score: isCorrect ? 1 : 0 },
        })
      );
    }

    setDisabled(true);
  };

  const handleTimeout = () => {
    if (socketRef.current && socketRef.current.readyState === 1) {
      socketRef.current.send(
        JSON.stringify({
          event: "question-timeout",
          payload: { name: nickname },
        })
      );
    }
    setDisabled(true);
  };

  return (
    <div className="player">
      <p className="player__info">Привет, {nickname}!</p>

      {accessDenied ? (
        <div className="player__access-denied">
          <h2 className="player__error">❌ Доступ к игре закрыт</h2>
          <p className="player__error-message">Ваш никнейм не в списке выбранных игроков.</p>
        </div>
      ) : !gameEnded ? (
        showResult ? (
          <div className="player__game-results">
            <h2 className="player__results-title">📊 Результаты раунда</h2>
            <table className="player__leaderboard">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Игрок</th>
                  <th>Очки</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>
                      {player.score} / {totalQuestions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {waitingNext && (
              <p className="player__waiting">⏳ Ожидание следующего вопроса...</p>
            )}
          </div>
        ) : prepareTime !== null ? (
          <h2 className="player__prepare-text">🎬 Подготовка... {prepareTime}</h2>
        ) : currentQuestion ? (
          <>
            <PlayerQuestions
              question={animatedDisplay}
              answer1={showOptions ? currentQuestion.answer1 : null}
              answer2={showOptions ? currentQuestion.answer2 : null}
              answer3={showOptions ? currentQuestion.answer3 : null}
              answer4={showOptions ? currentQuestion.answer4 : null}
              correct={currentQuestion.correct_answer}
              submitAnswer={submitAnswer}
              onTimeout={handleTimeout}
              showOptions={showOptions}
            />
            {showOptions && (
              <button
                className="player__speak-btn"
                onClick={speakQuestion}
                disabled={isSpeaking}
              >
                {isSpeaking ? "Озвучивается..." : "Озвучка"}
              </button>
            )}
          </>
        ) : (
          <p className="player__waiting-question">⏳ Ожидаем вопрос...</p>
        )
      ) : (
        <GameOver leaderboard={leaderboard} totalQuestions={totalQuestions} />
      )}
    </div>
  );
};

export default Player;