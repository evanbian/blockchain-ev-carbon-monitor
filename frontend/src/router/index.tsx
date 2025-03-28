// src/router/index.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import HomePage from '@/pages/Home';
import AdminPage from '@/pages/Admin';
import AnalysisPage from '@/pages/Analysis';
import DisplayPage from '@/pages/Display';

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/analysis/*" element={<AnalysisPage />} />
          <Route path="/display/*" element={<DisplayPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRouter;
