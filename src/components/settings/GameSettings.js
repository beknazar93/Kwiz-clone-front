import React, { useState } from "react";

const GameSettings = ({ onSaveSettings }) => {
  const [animationSpeed, setAnimationSpeed] = useState("normal");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSave = () => {
    onSaveSettings({ animationSpeed, soundEnabled });
  };

  return (
    <div className="game-settings">
      <h2>Настройки Игры</h2>

      <div className="setting">
        <label>Скорость анимации:</label>
        <select
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(e.target.value)}
        >
          <option value="fast">Быстрая</option>
          <option value="normal">Обычная</option>
          <option value="slow">Медленная</option>
        </select>
      </div>

      <div className="setting">
        <label>Включить звук:</label>
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={() => setSoundEnabled(!soundEnabled)}
        />
      </div>

      <button onClick={handleSave}>Сохранить настройки</button>
    </div>
  );
};

export default GameSettings;
