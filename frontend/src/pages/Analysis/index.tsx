// src/pages/Analysis/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AnalysisDashboard from './Dashboard';
import CarbonAnalysis from './Carbon';
import VehicleAnalysis from './Vehicle';
import PredictionAnalysis from './Prediction';

const AnalysisPage: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AnalysisDashboard />} />
      <Route path="/carbon" element={<CarbonAnalysis />} />
      <Route path="/vehicle" element={<VehicleAnalysis />} />
      <Route path="/prediction" element={<PredictionAnalysis />} />
      <Route path="*" element={<Navigate to="/analysis" replace />} />
    </Routes>
  );
};

export default AnalysisPage;