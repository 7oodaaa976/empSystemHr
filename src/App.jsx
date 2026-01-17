import { Routes, Route, Navigate } from "react-router-dom";
import NavbarApp from "./components/NavbarApp";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

import Dashboard from "./pages/Dashboard";
import Reports from './pages/Reports';





export default function App() {
  return (
    <>
      <NavbarApp />
      <Routes>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />

        <Route path="*" element={<div className="container py-4">404 Not Found</div>} />
      </Routes>
    </>
  );
}
