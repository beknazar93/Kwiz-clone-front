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
        <ul className="winners__history-list">
          {history.map((match) => (
            <li key={match.id} className="winners__history-item">
              <h4 className="winners__quiz-name">
                {match.quiz_name} ({match.level})
              </h4>
              <p className="winners__date">
                Дата: {new Date(match.date).toLocaleString()}
              </p>
              <ul className="winners__history-winners">
                {match.winners.map((winner, index) => (
                  <li key={winner.id} className="winners__history-winner">
                    {index + 1}. {winner.name} - {winner.score} очков
                  </li>
                ))}
              </ul>
              <button
                className="winners__delete-btn"
                onClick={() => handleDelete(match.id)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Winners;