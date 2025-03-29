import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Main from './components/Host/Main';
import NewQuiz from './components/Host/NewQuiz';
import Game from './components/Game/Game';
import Questions from './components/Host/Questions';
import NewQuestion from './components/Host/NewQuestion';
import Player from './components/Game/Player';
import EditQuestion from './components/Host/EditQuestion';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<Game />} />
        <Route path="/host" element={<Main />} />
        <Route path="/host/newQuiz" element={<NewQuiz />} />
        <Route path="/host/questions" element={<Questions />} />
        <Route path="/host/newquestion/:id" element={<NewQuestion />} />
        <Route path="/host/editquestion/:id" element={<EditQuestion />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </div>
  );
};

export default App;