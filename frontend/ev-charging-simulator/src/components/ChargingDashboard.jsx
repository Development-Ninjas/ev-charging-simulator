import React, { useEffect, useState } from 'react';
import batteryBg from '../../public/battery.webp';

export default function ChargingDashboard() {
  const [soc, setSoc] = useState(10);
  const [remaining, setRemaining] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [cost, setCost] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isCharging, setIsCharging] = useState(true);
  const userId = "admin123";

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "register", userId }));
      ws.send(JSON.stringify({ type: "start" }));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.userId === userId) {
        setSoc(data.soc);
        setRemaining(data.remainingHours);
        setEnergy(data.energyUsed);
        setCost(data.cost);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, []);
  const handleStart = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'start' }));
      setIsCharging(true);
    }
  };

  const handleStop = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'stop' }));
      setIsCharging(false);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
      <div
        className="relative h-64 w-full rounded-xl overflow-hidden mb-4 bg-no-repeat bg-center bg-contain"
        style={{ backgroundImage: `url(${batteryBg})` }}
      >
        <div
          className="absolute bottom-[13.5%] left-[39.6%] w-[21.8%] bg-green-500 transition-all duration-500 z-10 rounded-b-xl"
          style={{ height: `${soc * 0.62}%`, opacity: 0.8 }}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-black text-lg font-semibold drop-shadow-md z-20">
          {Math.floor(soc)}%<br />Charged
        </div>
      </div>
      <div className="text-green-900 space-y-2">
        <div>🔋 Energy Used: <strong>{energy.toFixed(2)} kWh</strong></div>
        <div>⏳ Remaining Time: <strong>{remaining.toFixed(2)} hrs</strong></div>
        <div>💰 Cost: <strong>₹{cost}</strong></div>
        <div className="flex justify-center space-x-4">
        <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Start</button>
        <button onClick={handleStop} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Stop</button>
        </div>
      </div>
    </div>
  );
}