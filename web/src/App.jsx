import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import AdminJournals from './pages/AdminJournals';
import AdminArticles from './pages/AdminArticles';
import Profile from './pages/Profile';
import AdminManajemen from './pages/AdminManajemen';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />

        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />

        <Route
          path="/admin/users"
          element={<PrivateRoute><AdminUsers /></PrivateRoute>}
        />

        <Route
          path="/admin/journals"
          element={<PrivateRoute><AdminJournals /></PrivateRoute>}
        />

        <Route
          path="/admin/articles"
          element={<PrivateRoute><AdminArticles /></PrivateRoute>}
        />

        <Route
          path="/profile"
          element={<PrivateRoute><Profile /></PrivateRoute>}
        />

        <Route
          path="/admin/manajemen"
          element={<PrivateRoute><AdminManajemen /></PrivateRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;