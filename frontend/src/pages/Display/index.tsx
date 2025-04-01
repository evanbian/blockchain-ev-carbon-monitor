// src/pages/Display/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DisplayOverview from './Overview';
import BlockchainExplorer from './Explorer';

const DisplayPage: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DisplayOverview />} />
      <Route path="/overview" element={<DisplayOverview />} />
      <Route path="/explorer" element={<BlockchainExplorer />} />
      <Route path="*" element={<Navigate to="/display" replace />} />
    </Routes>
  );
};

export default DisplayPage;