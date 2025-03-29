import React from "react";

const GameOver = ({ leaderboard = [] }) => {
  const sorted = [...leaderboard].sort((a, b) => b.score - a.score);

  return (
<div className="game-over">
  <h1 className="game-over__title">🏁 Игра завершена!</h1>
  <table className="game-over__leaderboard">
    <thead>
      <tr>
        <th className="game-over__leaderboard-header">#</th>
        <th className="game-over__leaderboard-header">Игрок</th>
        <th className="game-over__leaderboard-header">Очки</th>
      </tr>
    </thead>
    <tbody>
      {sorted.map((player, index) => (
        <tr key={index}>
          <td className="game-over__leaderboard-cell">{index + 1}</td>
          <td className="game-over__leaderboard-cell">{player.name}</td>
          <td className="game-over__leaderboard-cell">{player.score} pts</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
};

export default GameOver;
