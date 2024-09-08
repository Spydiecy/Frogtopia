import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import GameWorld from './pages/GameWorld';
import Profile from './pages/Profile';
import Minting from './pages/Minting';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/minting" element={<Minting />} />
        <Route path="/game" element={<GameWorld />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;