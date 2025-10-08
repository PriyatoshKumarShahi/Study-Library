import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/HomePage';
import Notes from './pages/Notes';
import PreviousPapers from './pages/PreviousPapers';
import Admin from './pages/Admin';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FacultyDashboard from './pages/FacultyDashboard';
import StudentAssignments from './pages/StudentAssignments';
import Forum from './pages/ForumDashboard';  
import ChannelPage from './pages/ChannelPage';
import AskAce from './components/AskAce'; // Import AskAce

function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = ['/login', '/register'].includes(location.pathname);
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {!hideNavbar && <Navbar />}
      {children}
      
      {/* AskAce Chatbot - Available on all pages */}
      <AskAce />
    </div>
  );
}

export default function App() {
  return (
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
          <Route path="/faculty-dashboard" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/student-assignments" element={<ProtectedRoute><StudentAssignments /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />  
          <Route path="/forum/channel/:id" element={<ProtectedRoute><ChannelPage /></ProtectedRoute>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Layout>
    </BrowserRouter>
  );
}
