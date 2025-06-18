const { WebSocketServer } = require('ws');


const wss = new WebSocketServer({ port: 4000 });

let soc = 10;
let kW = 7.4;
let isCharging = false;
const batteryCapacity = 50;
const pricePerkWh = 10;
let connectedClients = new Map();
const userSessions = new Map();

wss.on('connection', ws => {
  let userId = null;

  ws.on('message', data => {
    const msg = JSON.parse(data);

    if (msg.type === 'register') {
      userId = msg.userId;
      connectedClients.set(ws, userId);
      if (!userSessions.has(userId)) {
        userSessions.set(userId, {
          soc: 10,
          kW: 7.4,
          batteryCapacity: 50,
          isCharging: false,
        });
      }
    }

     if (msg.type === 'setRate') {
      const session = userSessions.get(userId);
      if (session) {
        session.kW = msg.kW;
        session.batteryCapacity = msg.batteryCapacity;
      }
    }

    if (msg.type === 'start') {
      const session = userSessions.get(userId);
      if (session) session.isCharging = true;
    }

    if (msg.type === 'stop') {
      const session = userSessions.get(userId);
      if (session) session.isCharging = false;
    }
  });

  const interval = setInterval(() => {
    for (const [client, uid] of connectedClients.entries()) {
      const session = userSessions.get(uid);
      if (!session || !session.isCharging || session.soc >= 100) continue;

      const deltaHours = (1 / 3600) * 5; // 5 sec simulation tick
      const addedKWh = session.kW * deltaHours;
      session.soc = Math.min(session.soc + (addedKWh / session.batteryCapacity) * 100, 100);

      const remainingKWh = (100 - session.soc) * session.batteryCapacity / 100;
      const remainingHours = remainingKWh / session.kW;
      const energyUsed = session.soc * session.batteryCapacity / 100;
      const cost = energyUsed * pricePerkWh;

       const payload = {
        userId: uid,
        soc: session.soc,
        remainingHours,
        energyUsed,
        cost: cost.toFixed(2),
      };

      // wss.clients.forEach(client => {
      //   if (client.readyState === ws.OPEN && connectedClients.get(client) === userId) {
      //     client.send(JSON.stringify(payload));
      //   }
      // });
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify(payload));
      }
    }
  }, 200);

  ws.on('close', () => {
    clearInterval(interval);
    connectedClients.delete(ws);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:4000");