require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Разрешаем запросы отовсюду, но позже добавим ограничение на Vercel URL
    methods: ['GET', 'POST']
  }
});

let multiplier = 1.0;
let isGameRunning = false;

const startGame = () => {
  isGameRunning = true;
  multiplier = 1.0;

  const interval = setInterval(() => {
    multiplier += 0.01;
    io.emit('multiplier', multiplier);

    if (Math.random() < 0.01) { // 1% шанс на обрушение в каждый момент времени
      isGameRunning = false;
      io.emit('crash', multiplier);
      clearInterval(interval);
    }
  }, 100);
};

io.on('connection', (socket) => {
  socket.emit('multiplier', multiplier);

  socket.on('start', () => {
    if (!isGameRunning) startGame();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
