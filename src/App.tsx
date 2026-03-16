/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminPemilih from './pages/AdminPemilih';
import AdminSesi from './pages/AdminSesi';
import AdminKandidat from './pages/AdminKandidat';
import AdminKonfirmasiQR from './pages/AdminKonfirmasiQR';
import AdminMonitoring from './pages/AdminMonitoring';
import AdminHasil from './pages/AdminHasil';
import AdminWinner from './pages/AdminWinner';
import AdminPengaturan from './pages/AdminPengaturan';
import WinnerPage from './pages/WinnerPage';
import VoteLogin from './pages/vote/VoteLogin';
import VoteSession from './pages/vote/VoteSession';
import VoteCategory from './pages/vote/VoteCategory';
import VoteSelect from './pages/vote/VoteSelect';
import VoteProgress from './pages/vote/VoteProgress';
import VoteSuccess from './pages/vote/VoteSuccess';
import VotingLayout from './components/VotingLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/winnerPage" element={<WinnerPage />} />
        <Route path="/login-admin" element={<AdminLogin />} />
        
        {/* Voting Booth Routes */}
        <Route path="/vote" element={<VoteLogin />} />
        <Route path="/vote" element={<VotingLayout />}>
          <Route path="session" element={<VoteSession />} />
          <Route path="category" element={<VoteCategory />} />
          <Route path="select" element={<VoteSelect />} />
          <Route path="progress" element={<VoteProgress />} />
          <Route path="success" element={<VoteSuccess />} />
        </Route>

        {/* Admin Routes wrapped in AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pemilih" element={<AdminPemilih />} />
          <Route path="sesi" element={<AdminSesi />} />
          <Route path="kandidat" element={<AdminKandidat />} />
          <Route path="konfirmasi-qr" element={<AdminKonfirmasiQR />} />
          <Route path="monitoring" element={<AdminMonitoring />} />
          <Route path="hasil" element={<AdminHasil />} />
          <Route path="winner" element={<AdminWinner />} />
          <Route path="pengaturan" element={<AdminPengaturan />} />
        </Route>

        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}
