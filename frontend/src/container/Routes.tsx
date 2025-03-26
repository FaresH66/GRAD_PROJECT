import { Routes, Route } from "react-router-dom";
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import Gatekeeper from '@/pages/Gatekeeper';
import Resident from '@/pages/Resident';

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/gatekeeper" element={<Gatekeeper />} />
        <Route path="/resident" element={<Resident />} />
    </Routes>
  );
}
