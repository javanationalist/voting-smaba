/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Halaman Utama & Khusus
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import WinnerPage from "./pages/WinnerPage";

// Import Halaman Admin
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminKandidat from "./pages/AdminKandidat";
import AdminPemilih from "./pages/AdminPemilih";
import AdminSesi from "./pages/AdminSesi";
import AdminHasil from "./pages/AdminHasil";
import AdminMonitoring from "./pages/AdminMonitoring";
import AdminKonfirmasiQR from "./pages/AdminKonfirmasiQR";
import AdminPengaturan from "./pages/AdminPengaturan";
import AdminWinner from "./pages/AdminWinner";

// Import Halaman Voting User
import VoteLogin from "./pages/vote/VoteLogin";
import VoteCategory from "./pages/vote/VoteCategory";
import VoteSelect from "./pages/vote/VoteSelect";
import VoteProgress from "./pages/vote/VoteProgress";
import VoteSuccess from "./pages/vote/VoteSuccess";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Rute Umum */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/winner" element={<WinnerPage />} />
        <Route path="/maintenance" element={<Maintenance />} />

        {/* Voting User Flow */}
        <Route path="/vote/login" element={<VoteLogin />} />
        <Route path="/vote/category" element={<VoteCategory />} />
        <Route path="/vote/select" element={<VoteSelect />} />
        <Route path="/vote/progress" element={<VoteProgress />} />
        <Route path="/vote/success" element={<VoteSuccess />} />

        {/* Admin Flow */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/kandidat" element={<AdminKandidat />} />
        <Route path="/admin/pemilih" element={<AdminPemilih />} />
        <Route path="/admin/sesi" element={<AdminSesi />} />
        <Route path="/admin/hasil" element={<AdminHasil />} />
        <Route path="/admin/monitoring" element={<AdminMonitoring />} />
        <Route path="/admin/konfirmasi-qr" element={<AdminKonfirmasiQR />} />
        <Route path="/admin/pengaturan" element={<AdminPengaturan />} />
        <Route path="/admin/winner" element={<AdminWinner />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}
