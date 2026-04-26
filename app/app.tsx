import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HeartScreen from './Components/HeartScreen';
import AboutScreen from './Components/AboutScreen';
import TransitionScreen from './Components/TransitionScreen';
import OnboardingScreen from './Components/OnboardingScreen';
import DashboardScreen from './Components/DashboardScreen';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HeartScreen />} />
                <Route path="/about" element={<AboutScreen />} />
                <Route path="/transition" element={<TransitionScreen />} />
                <Route path="/onboarding" element={<OnboardingScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
