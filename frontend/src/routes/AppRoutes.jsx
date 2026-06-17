import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ReviewPage from '../pages/ReviewPage';
import ItineraryDetailPage from '../pages/ItineraryDetailPage';
import HistoryPage from '../pages/HistoryPage';
import SharePage from '../pages/SharePage';
import MainLayout from '../layouts/MainLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Public Share Route */}
      <Route path="/share/:shareId" element={<SharePage />} />

      {/* Protected Routes inside MainLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/review"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ReviewPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/itinerary/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ItineraryDetailPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HistoryPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to Landing or Dashboard depending on auth */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
