import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectedPin as savePin } from "../../Ducks/Reducer";
import axios from "axios";
import GameOver from "./GameOver";
import { QRCodeCanvas } from "qrcode.react";

const Game = () => {
  const quiz = useSelector((state) => state.quiz || {});
  const selectedPin = useSelector((state) => state.selectedPin || 0);
  const dispatch = useDispatch();

  const [pin, setPin] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [players, setPlayers] = useState([]);
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [answeredPlayers, setAnsweredPlayers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const socketRef = useRef(null);

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

  const sendQuestion = (index) => {
    const question = questions[index];
    if (question && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setCurrentQuestion(index);
      setAnsweredPlayers([]);
      setShowResults(false);
      socketRef.current.send(JSON.stringify({
        event: "new-question",
        payload: question
      }));
    }
  };

  const showRoundResults = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        event: "question-results",
        payload: { leaderboard: leaderBoard }
      }));
    }
    setShowResults(true);
  };

  const handleNext = () => {
    const next = currentQuestion + 1;
    if (next < questions.length) {
      sendQuestion(next);
    } else {
      setGameOver(true);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          event: "game-over",
          payload: { leaderboard: leaderBoard }
        }));
      }
    }
  };

  useEffect(() => {
    if (!quiz.id) return;
    axios.get(`https://kwiz-clone2.onrender.com/api/quizzes/${quiz.id}/`)
      .then((res) => setQuestions(res.data.questions || []));
    generatePin();
  }, [quiz]);

  useEffect(() => {
    if (!selectedPin) return;
    const socket = new WebSocket(`wss://kwiz-clone2.onrender.com/ws/quiz/${selectedPin}/`);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        event: "host-join",
        payload: { pin: selectedPin }
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const name = data.payload && data.payload.name;

        switch (data.event) {
          case "player-joined":
            setPlayers((prev) => [...prev, { name }]);
            setLeaderBoard((prev) => {
              if (!prev.find(p => p.name === name)) {
                return [...prev, { name, score: 0 }];
              }
              return prev;
            });
            break;

          case "player-answer":
            setLeaderBoard((prev) => {
              const updated = [...prev];
              const index = updated.findIndex(p => p.name === name);
              if (index !== -1) {
                updated[index].score += 1;
              }
              return updated;
            });

            setAnsweredPlayers((prev) => {
              if (!prev.includes(name)) {
                const updated = [...prev, name];
                if (updated.length === players.length) {
                  showRoundResults();
                }
                return updated;
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
      } catch (err) {
        console.error("Ошибка WebSocket:", err);
      }
    };

    return () => socket.close();
  }, [selectedPin, players.length]);

  const gameLink = `https://kwiz-clone2.onrender.com/join?pin=${pin}`;

  return (
<div className="game__container">
  {!isLive && !gameOver && (
    <div className="game__pre-start">
      <div className="game__pin">
        <p className="game__pin-title">Kwizz PIN</p>
        <h1 className="game__pin-number">{pin}</h1>
        <QRCodeCanvas value={gameLink} size={200} />
        <p className="game__scan-instruction">📷 Scan to Join</p>
      </div>

      <div className="game__player-list">
        <button onClick={startGame} className="game__play-btn">Play</button>
        <p className="game__joined-notice">Players joined!</p>
        {players.map((p, i) => (
          <p key={i} className="game__player-name">{p.name}</p>
        ))}
      </div>
    </div>
  )}

  {isLive && !gameOver && !showResults && (
    <div className="game__active">
      <h2 className="game__status-message">⏳ Игра запущена</h2>
      <p className="game__question-counter">Вопрос {currentQuestion + 1} из {questions.length}</p>
    </div>
  )}

  {isLive && !gameOver && showResults && (
    <div className="game__results">
      <h2 className="game__round-results">📊 Результаты раунда</h2>
      <table className="game__leaderboard">
        <thead>
          <tr><th>#</th><th>Игрок</th><th>Очки</th></tr>
        </thead>
        <tbody>
          {leaderBoard.map((player, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{player.name}</td>
              <td>{player.score} pts</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleNext} className="game__next-question-btn">➡️ Следующий вопрос</button>
    </div>
  )}

  {gameOver && (
    <GameOver leaderboard={leaderBoard} />
  )}
</div>

  );
};

export default Game;
