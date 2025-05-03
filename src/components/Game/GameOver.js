import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const GameOver = ({ leaderboard = [], totalQuestions = 0 }) => {
  const nickname = useSelector((state) => state.nickname) || "Player1";
  const avatars = JSON.parse(localStorage.getItem("avatars") || "{}");
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
  const medals = ["🥇", "🥈", "🥉"];
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState(null);

  useEffect(() => {
    if (!sorted.length || !hasInteracted) return;

    const playerIndex = sorted.findIndex(
      (p) => p.name.toLowerCase() === nickname.toLowerCase()
    );
    if (playerIndex === -1) return;

    const isWinner = playerIndex < 3;
    setAnimationType(isWinner ? "winner" : "loser");
    setShowAnimation(true);

    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, [hasInteracted, sorted, nickname]);

  return (
    <div className="game-over" onClick={() => setHasInteracted(true)}>
      {showAnimation && (
        <div
          className={`game-over__animation game-over__animation--${animationType}`}
        >
          <h1 className="game-over__animation-text">
            {animationType === "winner" ? "Победа!" : "Проиграли!"}
          </h1>
        </div>
      )}

      <h1>🏁 Игра завершена!</h1>

      <div className="game-over__top3">
        {sorted.slice(0, 3).map((player, index) => (
          <div
            key={index}
            className={`game-over__winner game-over__winner--${index + 1}`}
          >
            <img
              src={avatars[player.name] || "https://via.placeholder.com/80"}
              alt={player.name}
              className="game-over__avatar"
              width={80}
              height={80}
            />
            <span>{medals[index]}</span>
            <p>{player.name}</p>
            <p>
              {player.score} / {totalQuestions}
            </p>
          </div>
        ))}
      </div>

      <h2>Результаты</h2>

      <div className="game-over__leaderboard">
        {sorted.map((player, index) => (
          <div key={index} className="game-over__leaderboard-item">
            <span>{index < 3 ? medals[index] : index + 1}</span>
            <img
              src={avatars[player.name] || "https://via.placeholder.com/40"}
              alt={player.name}
              className="game-over__avatar"
              width={40}
              height={40}
              style={{ borderRadius: "50%", marginRight: 8 }}
            />
            <span>{player.name}</span>
            <span>
              {player.score} / {totalQuestions}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameOver;