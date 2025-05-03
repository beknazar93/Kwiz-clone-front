import React, { useEffect, useState } from "react";
import axios from "axios";

const Winners = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("https://rasu0101.pythonanywhere.com/winners/winners/")
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Ошибка загрузки истории:", err));
  }, []);

  const handleDelete = (id) => {
    axios
      .delete(`https://rasu0101.pythonanywhere.com/winners/winners/${id}/`)
      .then(() => {
        setHistory(history.filter((match) => match.id !== id));
        console.log(`Матч с id ${id} удален`);
      })
      .catch((err) => console.error("Ошибка удаления:", err));
  };

  return (
    <div className="winners__container">
      <h3 className="winners__title">📜 История матчей</h3>
      {history.length === 0 ? (
        <p className="winners__empty">История пока пуста</p>
      ) : (
        <div className="winners__scroll-container">
          <table className="winners__table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Уровень</th>
                <th>Победители</th>
                <th>Удалить</th>
              </tr>
            </thead>
            <tbody>
              {history.map((match) => {
                const sortedWinners = [...match.winners].sort(
                  (a, b) => b.score - a.score
                );
                return (
                  <tr key={match.id}>
                    <td>{new Date(match.date).toLocaleString()}</td>
                    <td>{match.level}</td>
                    <td>
                      <ul className="winners__winner-list">
                        {sortedWinners.map((winner, index) => (
                          <li key={winner.id}>
                            {index + 1}. {winner.name} — {winner.score} очков
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <button
                        className="winners__delete-btn"
                        onClick={() => handleDelete(match.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Winners;
