require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Проверяем Telegram-авторизацию
const verifyTelegramAuth = async (initData) => {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;

  try {
    const response = await axios.get(url);
    if (response.data.ok) {
      return true; // Telegram подтверждает бота
    }
  } catch (error) {
    console.error("Ошибка проверки Telegram:", error.message);
  }

  return false;
};

// API для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Backend работает! Telegram API подключен.');
});

// Подключение к WebSocket
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Получаем данные от клиента и проверяем Telegram
  socket.on('telegram_auth', async (data) => {
    const isValid = await verifyTelegramAuth(data.initData);
    if (isValid) {
      console.log("✅ Telegram авторизация успешна:", data);
      socket.emit('auth_success', { message: "Авторизация успешна!" });
    } else {
      console.log("❌ Ошибка авторизации!");
      socket.emit('auth_error', { message: "Ошибка авторизации!" });
    }
  });

  // Обрабатываем сообщения от клиента
  socket.on('message', (data) => {
    console.log('Сообщение от клиента:', data);
    io.emit('message', data);
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
