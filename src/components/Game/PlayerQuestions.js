import React, { useState, useEffect } from "react";
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
  const [selectedOption, setSelectedOption] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const handleOptionClick = (optionIndex) => {
    if (!isTimeout) {
      setSelectedOption(optionIndex);
      console.log("PlayerQuestions: selected option =", optionIndex);
    }
  };

  const handleTimeout = () => {
    setIsTimeout(true);
    if (selectedOption !== null) {
      submitAnswer(selectedOption);
      console.log("PlayerQuestions: submit on timeout =", selectedOption);
    } else {
      console.log("PlayerQuestions: no selection, timeout");
    }
    onTimeout();
  };

  useEffect(() => {
    setSelectedOption(null);
    setIsTimeout(false);
  }, [question]);

  return (
    <div className="player-questions">
      {showOptions && (
        <Timer
          duration={15}
          onTimeout={handleTimeout}
          className="player-questions__timer"
        />
      )}

      <h2 className="player-questions__title">{question}</h2>

      {showOptions && (
        <div className="player-questions__grid">
          {[answer1, answer2, answer3, answer4].map((answer, i) => {
            const optionIndex = i + 1;
            return (
              <div
                key={optionIndex}
                className={`player-questions__option
                  ${
                    selectedOption === optionIndex
                      ? "player-questions__option--selected"
                      : ""
                  }
                  ${isTimeout ? "player-questions__option--disabled" : ""}
                `}
                onClick={() => handleOptionClick(optionIndex)}
              >
                {answer}
              </div>
            );
          })}
        </div>
      )}

      {selectedOption !== null && !isTimeout && (
        <p className="player-questions__confirmation">
          ✅ Ответ выбран, ожидайте окончания таймера...
        </p>
      )}
    </div>
  );
};

export default PlayerQuestions;