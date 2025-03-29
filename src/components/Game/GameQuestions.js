import React, { useEffect } from "react";
import Timer from "./Timer";
import triangle from '../../Assests/triangle.svg';
import diamond from '../../Assests/diamond.svg';
import square from '../../Assests/square.svg';
import circle from '../../Assests/circle.svg';

export default function GameQuestions(props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      props.questionOver(); // автоматически перейти
    }, 10000);

    return () => clearTimeout(timer);
  }, [props.question]); // 👈 следим за props.question

  return (
<div className="game-questions">
  <Timer duration={15} />
  <h1 className="game-questions__title">{props.question}</h1>
  <div className="game-questions__grid">
    <div className="game-question game-question--triangle" onClick={props.questionOver}>
      <div className="game-question__shape"><img src={triangle} alt="" className="game-question__img" /></div>
      <p className="game-question__text">{props.answer1}</p>
    </div>
    <div className="game-question game-question--diamond" onClick={props.questionOver}>
      <div className="game-question__shape"><img src={diamond} alt="" className="game-question__img" /></div>
      <p className="game-question__text">{props.answer2}</p>
    </div>
    <div className="game-question game-question--square" onClick={props.questionOver}>
      <div className="game-question__shape"><img src={square} alt="" className="game-question__img" /></div>
      <p className="game-question__text">{props.answer3}</p>
    </div>
    <div className="game-question game-question--circle" onClick={props.questionOver}>
      <div className="game-question__shape"><img src={circle} alt="" className="game-question__img" /></div>
      <p className="game-question__text">{props.answer4}</p>
    </div>
  </div>
</div>

  );
}
