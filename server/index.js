import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameRoom } from './gameState.js';
import { firebaseAdapter } from './firebaseAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const room = new GameRoom();

const publish = (snapshot) => {
  io.emit('room:update', snapshot);
  firebaseAdapter.syncState(snapshot);
};

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.get('/api/state', (req, res) => {
  res.json(room.snapshot());
});

// Socket.IO: semua aksi lewat satu pintu, diproses oleh mesin permainan bersama
io.on('connection', (socket) => {
  socket.emit('room:update', room.snapshot());

  socket.on('game:action', ({ action, payload } = {}) => {
    if (typeof action !== 'string') return;
    if (action === 'sync:request') {
      socket.emit('room:update', room.snapshot());
      return;
    }
    publish(room.apply(action, payload || {}));
  });
});

// akhiri permainan saat 15 menit habis
setInterval(() => {
  if (room.isTimeUp()) publish(room.apply('game:timeup', {}));
  else if (room.hasPendingExplosion()) publish(room.apply('game:tick', {}));
}, 250);

// Serve frontend if in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Server Socket.IO aktif di port 3000. Jalankan Vite di port 5173 untuk frontend.');
    }
  });
});

// Detect Local Network IPs prioritizing Wi-Fi/LAN (192.168.x.x, 10.x.x.x)
function getAllLocalIps() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        // Skip APIPA 169.254.x.x if possible
        if (!net.address.startsWith('169.254')) {
          ips.push({ name, address: net.address });
        }
      }
    }
  }
  // Sort so 192.168 or 10.x comes first
  ips.sort((a, b) => {
    if (a.address.startsWith('192.168.')) return -1;
    if (b.address.startsWith('192.168.')) return 1;
    return 0;
  });
  return ips.length > 0 ? ips : [{ name: 'localhost', address: 'localhost' }];
}

app.get('/api/network-info', (req, res) => {
  const ips = getAllLocalIps();
  res.json({ ips, port: PORT });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const ips = getAllLocalIps();
  const primaryIp = ips[0].address;
  console.log('\n======================================================');
  console.log(' PANJAT TEBING STRUKDAT: SERVER REALTIME SIAP');
  console.log('======================================================');
  console.log(` 💻 DASHBOARD GURU (Laptop):    http://localhost:${PORT}`);
  console.log(` 📱 HP SISWA (Scan QR / Buka):  http://${primaryIp}:${PORT}/?role=student`);
  if (ips.length > 1) {
    console.log(` 🌐 IP Alternatif (Jika Beda Wi-Fi):`);
    ips.slice(1).forEach(ip => {
      console.log(`    - http://${ip.address}:${PORT}/?role=student (${ip.name})`);
    });
  }
  console.log(` ⚡ VITE DEV SERVER:            http://localhost:5173`);
  console.log('======================================================\n');
});
