// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/HomePage';
import Notes from './pages/Notes';
import PreviousPapers from './pages/PreviousPapers';
import Admin from './pages/Admin';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {!hideNavbar && <Navbar />}
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/papers" element={<PreviousPapers />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000}  />
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
