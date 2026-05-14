import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminJournals from "./pages/AdminJournals";
import AdminArticles from "./pages/AdminArticles";
import Profile from "./pages/Profile";
import DataAdmin from "./pages/DataAdmin";
import ApiTester from "./pages/ApiTester";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* halaman login */}
        <Route path="/" element={<Auth />} />

        {/* halaman setelah login */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/journals" element={<AdminJournals />} />
        <Route path="/admin/articles" element={<AdminArticles />} />
        <Route path="/admin/data-admin" element={<DataAdmin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/api-tester" element={<ApiTester />} />
      </Routes>
    </BrowserRouter>
  );
}