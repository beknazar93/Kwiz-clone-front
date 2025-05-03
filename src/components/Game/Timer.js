import React, { useEffect, useState } from "react";

const Timer = ({ duration = 15, onTimeout }) => {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    if (seconds === 0) {
      onTimeout();
      return;
    }
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onTimeout]);

  return (
    <div className="timer">
      <span className="timer__icon">⏱️</span>
      <span className="timer__seconds">{seconds}с</span>
    </div>
  );
};

export default Timer;
