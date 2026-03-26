import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Articles from './pages/Articles';
import BibliotherapyPage from './pages/BibliotherapyPage';
import Profile from './pages/Profile';
import Breathing from './pages/Breathing';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
        <Route path="/articles" element={<PrivateRoute><BibliotherapyPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/breathing" element={<PrivateRoute><Breathing /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;