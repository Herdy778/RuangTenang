import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminJournals from "./pages/AdminJournals";
import AdminArticles from "./pages/AdminArticles";
import Profile from "./pages/Profile";
import DataAdmin from "./pages/DataAdmin";

export default function App() {
  return (
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/journals" element={<AdminJournals />} />
      <Route path="/admin/articles" element={<AdminArticles />} />
      <Route path="/admin/data-admin" element={<DataAdmin />} />
      <Route path="/profile" element={<Profile />} />
     </Routes>
    </BrowserRouter>
  );
}