import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Landing from './components/Landing/Landing';
import Game from './components/Game/Game';
import Player from './components/Game/Player';

import UserProfile from './components/Profile/UserProfile';
import Winners from './components/Profile/Winners';

import Main from './components/Host/Main';
import NewQuiz from './components/Host/NewQuiz';
import Questions from './components/Host/Questions';
import NewQuestion from './components/Host/NewQuestion';
import EditQuestion from './components/Host/EditQuestion';

import './App.css';
import './App.scss';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<Game />} />
        <Route path="/player" element={<Player />} />

        {/* 🧑‍💼 Профиль администратора */}
        <Route path="/admin" element={<UserProfile />} />
        <Route path="/winners" element={<Winners />} />

        {/* 🧠 Host */}
        <Route path="/host" element={<Main />} />
        <Route path="/host/newquiz" element={<NewQuiz />} />
        <Route path="/host/questions" element={<Questions />} />
        <Route path="/host/newquestion/:id" element={<NewQuestion />} />
        <Route path="/host/editquestion/:id" element={<EditQuestion />} />
      </Routes>
    </div>
  );
};

export default App;
