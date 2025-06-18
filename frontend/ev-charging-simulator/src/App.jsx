import React from 'react';
import Header from './components/Header';
import ChargingDashboard from './components/ChargingDashboard';

export default function App() {
  return (
    <div className="bg-green-50 min-h-screen">
      <Header />
      <div className="flex justify-center p-4">
        <ChargingDashboard />
      </div>
    </div>
  );
}
