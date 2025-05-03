import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PlayerQuestions from "./PlayerQuestions";
import GameOver from "./GameOver";

const Player = () => {
  const selectedPin = useSelector((state) => state.selectedPin);
  const nickname = useSelector((state) => state.nickname) || "Player1";
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
  const [accessDenied, setAccessDenied] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState(600);
  const [currentText, setCurrentText] = useState("");
  const [timerDuration, setTimerDuration] = useState(15);

  const socketRef = useRef(null);
  const animationIntervalRef = useRef(null);

  const uniqueKey = `sessionId_${selectedPin}_${Date.now()}_${Math.random()}`;
  const sessionId = useRef(
    localStorage.getItem(uniqueKey) || crypto.randomUUID()
  ).current;
  localStorage.setItem(uniqueKey, sessionId);

  const startPreparation = (questionText) => {
    let seconds = 5;
    setPrepareTime(seconds);

    const countdown = setInterval(() => {
      seconds -= 1;
      setPrepareTime(seconds);

      if (seconds <= 0) {
        clearInterval(countdown);
        setPrepareTime(null);
        setCurrentText(questionText);
        animateQuestion(questionText);
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(
            JSON.stringify({
              event: "player-ready",
              payload: { name: nickname, sessionId },
            })
          );
        }
      }
    }, 1000);
  };

  const animateQuestion = (text) => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }

    const parts = text
      .trim()
      .split(/(?<=\s)|(?=\s)/)
      .filter((part) => part.trim());
    let index = 0;
    setAnimatedDisplay("");

    animationIntervalRef.current = setInterval(() => {
      if (index < parts.length) {
        const part = parts[index];
        setAnimatedDisplay(part);

        setTimeout(() => {
          setAnimatedDisplay("");
        }, animationSpeed / 2);

        index += 1;
      } else {
        clearInterval(animationIntervalRef.current);
        setTimeout(() => setShowOptions(true), animationSpeed / 2);
      }
    }, animationSpeed);
  };

  useEffect(() => {
    if (
      currentText &&
      !showOptions &&
      !prepareTime &&
      !showResult &&
      !gameEnded &&
      !accessDenied
    ) {
      console.log(
        "Player.js: Перезапускаем анимацию с новой скоростью:",
        animationSpeed
      );
      animateQuestion(currentText);
    }
  }, [
    animationSpeed,
    currentText,
    showOptions,
    prepareTime,
    showResult,
    gameEnded,
    accessDenied,
  ]);

  useEffect(() => {
    if (!selectedPin || !nickname) {
      console.log("Player.js: selectedPin или nickname отсутствуют", {
        selectedPin,
        nickname,
      });
      return;
    }

    console.log(
      "Player.js: Подключаемся к WebSocket с PIN:",
      selectedPin,
      "и никнеймом:",
      nickname,
      "sessionId:",
      sessionId
    );

    const socket = new WebSocket(`wss://bektur.onrender.com/${selectedPin}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Player.js: WebSocket подключён");
      const trimmedNickname = nickname.trim().toLowerCase();
      socket.send(
        JSON.stringify({
          event: "player-joined",
          payload: { name: trimmedNickname, sessionId },
        })
      );
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Player.js: Получено сообщение:", data);

      switch (data.event) {
        case "new-question":
          if (!accessDenied) {
            setCurrentQuestion(data.payload);
            setTimerDuration(data.payload.timerDuration || 15);
            setDisabled(false);
            setShowOptions(false);
            setShowResult(false);
            setWaitingNext(false);
            setAnimatedDisplay("");
            setTotalQuestions((prev) => prev + 1);
            setAccessDenied(null);
            startPreparation(data.payload.question);
          }
          break;

        case "start-game-timer":
          setTimerDuration(data.payload.duration || 15);
          console.log("Player.js: Начало игрового таймера:", data.payload.duration);
          break;

        case "game-over":
          setGameEnded(true);
          setLeaderboard(data.payload.leaderboard || []);
          console.log(
            "Player.js: Игра окончена, лидерборд:",
            data.payload.leaderboard
          );
          break;

        case "question-results":
          setLeaderboard(data.payload.leaderboard || []);
          setShowResult(true);
          setWaitingNext(true);
          setDisabled(false);
          console.log(
            "Player.js: Результаты раунда:",
            data.payload.leaderboard
          );
          break;

        case "access-denied":
          console.log(
            "Player.js: Доступ запрещён, причина:",
            data.payload.reason
          );
          setAccessDenied(data.payload.reason || "unknown");
          setCurrentQuestion(null);
          setShowOptions(false);
          setShowResult(false);
          setWaitingNext(false);
          setAnimatedDisplay("");
          setPrepareTime(null);
          break;

        case "animation-speed":
          console.log(
            "Player.js: Новая скорость анимации:",
            data.payload.speed
          );
          setAnimationSpeed(data.payload.speed || 600);
          break;

        case "time-update":
          setTimerDuration(data.payload.time);
          if (data.payload.time <= 0) {
            handleTimeout();
          }
          break;

        default:
          break;
      }
    };

    socket.onerror = (error) => {
      console.error("Player.js: Ошибка WebSocket:", error);
    };

    socket.onclose = () => {
      console.log("Player.js: WebSocket закрыт, пытаемся переподключиться...");
      setTimeout(() => {
        socketRef.current = new WebSocket(`wss://bektur.onrender.com/${selectedPin}`);
      }, 3000);
    };

    return () => {
      socket.close();
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [selectedPin, nickname, sessionId]);

  const submitAnswer = (chosen) => {
    if (!currentQuestion || disabled || accessDenied || prepareTime !== null) {
      console.log("Player.js: Ответ заблокирован", {
        currentQuestion: !!currentQuestion,
        disabled,
        accessDenied,
        prepareTime,
      });
      return;
    }

    const isCorrect = chosen === currentQuestion.correct_answer;
    const score = isCorrect ? 1 : 0;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Player.js: Отправляем ответ:", { isCorrect, chosen, score });
      socketRef.current.send(
        JSON.stringify({
          event: "player-answer",
          payload: { name: nickname, score, sessionId, questionId: currentQuestion.id },
        })
      );
    } else {
      console.log("Player.js: WebSocket не готов для отправки ответа");
    }

    setDisabled(true);
  };

  const handleTimeout = () => {
    if (!currentQuestion || disabled || accessDenied || prepareTime !== null) {
      console.log("Player.js: Таймаут заблокирован", {
        currentQuestion: !!currentQuestion,
        disabled,
        accessDenied,
        prepareTime,
      });
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Player.js: Время вышло, отправляем таймаут");
      socketRef.current.send(
        JSON.stringify({
          event: "question-timeout",
          payload: { name: nickname, score: 0, sessionId, questionId: currentQuestion.id },
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
          <p className="player__error-message">
            {accessDenied === "duplicate-name"
              ? "Этот никнейм уже используется на другом устройстве."
              : accessDenied === "invalid-name"
              ? "Ваш никнейм не в списке выбранных игроков."
              : "Некорректные данные. Попробуйте снова."}
          </p>
        </div>
      ) : !gameEnded ? (
        showResult ? (
          <div className="player__game-results">
            {waitingNext && (
              <p className="player__waiting">
                ⏳ Ожидание следующего вопроса...
              </p>
            )}
          </div>
        ) : prepareTime !== null ? (
          <h2 className="player__prepare-text">
            🎬 Подготовка... {prepareTime}
          </h2>
        ) : currentQuestion ? (
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
            timerDuration={timerDuration}
          />
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