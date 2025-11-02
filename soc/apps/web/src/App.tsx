import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import Tools from './pages/Tools';
import Intelligence from './pages/Intelligence';
import Incidents from './pages/Incidents';
import Automation from './pages/Automation';
import Endpoints from './pages/Endpoints';
import Network from './pages/Network';
import Simulation from './pages/Simulation';
import Stack from './pages/Stack';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/intelligence" element={<Intelligence />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/endpoints" element={<Endpoints />} />
        <Route path="/network" element={<Network />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/stack" element={<Stack />} />
        <Route path="/" element={<Overview />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;