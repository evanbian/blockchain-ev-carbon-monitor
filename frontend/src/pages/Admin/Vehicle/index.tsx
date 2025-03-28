// src/pages/Admin/Vehicle/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VehicleList from './VehicleList';
import VehicleForm from './VehicleForm';
import VehicleDetail from './VehicleDetail';

const VehicleRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<VehicleList />} />
      <Route path="/add" element={<VehicleForm mode="add" />} />
      <Route path="/edit/:vin" element={<VehicleForm mode="edit" />} />
      <Route path="/view/:vin" element={<VehicleDetail />} />
      <Route path="*" element={<Navigate to="/admin/vehicles" replace />} />
    </Routes>
  );
};

export default VehicleRouter;
