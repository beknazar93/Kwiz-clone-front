import React from "react";

const GameOver = ({ leaderboard = [], totalQuestions = 0 }) => {
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="game-over">
      <h1 className="game-over__title">🏁 Игра завершена!</h1>

      <h2 className="game-over__subtitle">Результаты</h2>
      <table className="game-over__leaderboard">
        <thead>
          <tr>
            <th>#</th>
            <th>Игрок</th>
            <th>Очки</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player, index) => (
            <tr key={index}>
              <td>{index < 3 ? medals[index] : index + 1}</td>
              <td>{player.name}</td>
              <td>
                {player.score} / {totalQuestions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameOver;