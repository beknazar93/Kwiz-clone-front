import React from "react";
import Timer from "./Timer";

const PlayerQuestions = ({
  question,
  answer1,
  answer2,
  answer3,
  answer4,
  correct,
  submitAnswer,
  onTimeout,
  showOptions,
}) => {
  return (
    <div className="player-questions">
      {showOptions ? <Timer duration={15} onTimeout={onTimeout} className="player-questions__timer" /> : null}
      <h2 className="player-questions__title">{question}</h2>
      {showOptions && (
        <div className="player-questions__grid">
          <div className="player-questions__option" onClick={() => submitAnswer(1)}>{answer1}</div>
          <div className="player-questions__option" onClick={() => submitAnswer(2)}>{answer2}</div>
          <div className="player-questions__option" onClick={() => submitAnswer(3)}>{answer3}</div>
          <div className="player-questions__option" onClick={() => submitAnswer(4)}>{answer4}</div>
        </div>
      )}
    </div>
  );
};

export default PlayerQuestions;