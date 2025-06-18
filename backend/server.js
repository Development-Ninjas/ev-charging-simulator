const { WebSocketServer } = require('ws');


const wss = new WebSocketServer({ port: 4000 });

let soc = 10;
let kW = 7.4;
let isCharging = false;
const batteryCapacity = 50;
const pricePerkWh = 10;
let connectedClients = new Map();

wss.on('connection', ws => {
  let userId = null;

  ws.on('message', data => {
    const msg = JSON.parse(data);

    if (msg.type === 'register') {
      userId = msg.userId;
      connectedClients.set(ws, userId);
    }

    if (msg.type === 'start') isCharging = true;
    if (msg.type === 'stop') isCharging = false;
    if (msg.type === 'setRate') kW = msg.kW;
  });

  const interval = setInterval(() => {
    if (isCharging && soc < 100) {
      const deltaHours = 1 / 3600;
      const addedKWh = kW * deltaHours;
      soc = Math.min(soc + (addedKWh / batteryCapacity) * 100, 100);

      const remainingKWh = (100 - soc) * batteryCapacity / 100;
      const remainingHours = remainingKWh / kW;
      const energyUsed = soc * batteryCapacity / 100;
      const cost = energyUsed * pricePerkWh;

      const payload = {
        userId,
        soc,
        remainingHours,
        energyUsed,
        cost: cost.toFixed(2),
      };

      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN && connectedClients.get(client) === userId) {
          client.send(JSON.stringify(payload));
        }
      });
    }
  }, 1000);

  ws.on('close', () => {
    clearInterval(interval);
    connectedClients.delete(ws);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:4000");