import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import RegisterLender from './components/RegisterLender';
import RegisterBorrower from './components/RegisterBorrower';
import AdminDashboard from './components/AdminDashboard';
import LenderDashboard from './components/LenderDashboard';
import BorrowerDashboard from './components/BorrowerDashboard';
import AnalystDashboard from './components/AnalystDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register/lender" element={<RegisterLender />} />
      <Route path="/register/borrower" element={<RegisterBorrower />} />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/lender"
        element={
          <ProtectedRoute allowedRoles={['lender']}>
            <LenderDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/borrower"
        element={
          <ProtectedRoute allowedRoles={['borrower']}>
            <BorrowerDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/analyst"
        element={
          <ProtectedRoute allowedRoles={['analyst']}>
            <AnalystDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
