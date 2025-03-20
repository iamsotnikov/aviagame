require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const mongoose = require("mongoose");
const connectDB = require("./db");
const Player = require("./models/Player");
const Bet = require("./models/Bet");
const Game = require("./models/Game");


connectDB(); // Запускаем подключение к MongoDB

const app = express();
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json()); // Добавляем поддержку JSON-запросов

// Эндпоинт для получения баланса игрока
app.get("/get_balance", async (req, res) => {
  const { playerId } = req.query;

  if (!playerId) {
    return res.status(400).json({ message: "playerId обязателен" });
  }

  try {
    let player = await Player.findOne({ username: playerId });

    if (!player) {
      player = await Player.create({ username: playerId, balance: 1000 });
    }

    res.json({ balance: player.balance });
  } catch (error) {
    console.error("Ошибка при получении баланса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Эндпоинт последних ставок игрока
app.get("/bet_history", async (req, res) => {
  const { telegramId } = req.query;

  if (!telegramId) {
    return res.status(400).json({ message: "Не указан Telegram ID" });
  }

  try {
    let player = await Player.findOne({ telegramId });

    if (!player) {
      return res.status(404).json({ message: "Игрок не найден" });
    }

    const bets = await Bet.find({ playerId: player._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ bets });
  } catch (error) {
    console.error("Ошибка получения истории ставок:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Эндпоинт истории всех игр
app.get("/game_history", async (req, res) => {
  try {
    const games = await Game.find().sort({ endedAt: -1 }).limit(10);
    res.json({ games });
  } catch (error) {
    console.error("Ошибка получения истории игр:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


// Эндпоинт для Телеграм ИД

app.post("/register", async (req, res) => {
  const { playerId, telegramId } = req.body;
  console.log("Получен запрос на регистрацию:", req.body); // Логируем данные запроса

  if (!playerId || !telegramId) {
    return res.status(400).json({ message: "playerId и telegramId обязательны" });
  }

  try {
    let player = await Player.findOne({ username: playerId });

    if (player) {
      player.telegramId = telegramId;
      await player.save();
      return res.json({ message: "Telegram ID привязан", player });
    }

    const newPlayer = await Player.create({
      username: playerId,
      telegramId,
      balance: 1000,
    });

    res.json({ message: "Игрок зарегистрирован", player: newPlayer });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


//Эндпоинт для создания ставки
app.post("/place_bet", async (req, res) => {
  const { telegramId, amount } = req.body;

  if (!telegramId || amount <= 0) {
    return res.status(400).json({ message: "Некорректные данные" });
  }

  try {
    let player = await Player.findOne({ telegramId });

    if (!player) {
      return res.status(404).json({ message: "Игрок не найден" });
    }

    if (player.balance < amount) {
      return res.status(400).json({ message: "Недостаточно средств" });
    }

    player.balance -= amount;
    await player.save();

    const bet = await Bet.create({
      playerId: player._id,
      amount,
    });

    res.json({ message: "Ставка принята", balance: player.balance });
    console.log(`🎲 Игрок ${telegramId} сделал ставку ${amount}`);
  } catch (error) {
    console.error("Ошибка при ставке:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});


//Эндпоинт для кэшаута
app.post("/cash_out", async (req, res) => {
  const { telegramId, multiplier } = req.body;

  if (!telegramId || !multiplier || multiplier < 1.0) {
    return res.status(400).json({ message: "Некорректные данные" });
  }

  try {
    let player = await Player.findOne({ telegramId });

    if (!player) {
      return res.status(404).json({ message: "Игрок не найден" });
    }

    const bet = await Bet.findOne({ playerId: player._id }).sort({ createdAt: -1 });

    if (!bet) {
      return res.status(400).json({ message: "Нет активной ставки" });
    }

    const payout = Math.floor(bet.amount * multiplier);
    player.balance += payout;
    await player.save();

    await Bet.deleteOne({ _id: bet._id });

    res.json({ message: "Кэшаут успешен", payout, balance: player.balance });
    console.log(`💰 Игрок ${telegramId} кэшаутнул при ${multiplier}x и получил ${payout}`);
  } catch (error) {
    console.error("Ошибка при кэшауте:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});



const PORT = process.env.PORT || 3000;

let gameActive = false;
let crashPoint = 1.0;
let gameInterval;
let activeBets = {};
let targetCrashPoint = 1.0;
let gameCount = 0; // Количество игр
let playerLossPhase = false; // Фаза проигрышей
let gameStartTime = null;


// Улучшенная функция генерации коэффициента
function generateCrashMultiplier() {
    const houseEdge = 0.08;
    let R = Math.random();
    if (R === 0) R = 0.0001;

    let alpha = playerLossPhase ? 2.5 : 1.2 + Math.random() * 0.4;
    let crashMultiplier = (1 - houseEdge) / (1 - Math.pow(R, alpha));

    crashMultiplier = Math.max(1.00, parseFloat(crashMultiplier.toFixed(2)));

    gameCount++;
    if (gameCount >= 10 && !playerLossPhase) {
        playerLossPhase = true;
        console.log("⚠️ Игрок переходит в фазу проигрыша!");
    }

    return crashMultiplier;
}


// Обратный отсчет перед игрой
function startCountdown() {
  countdown = 9;
  const interval = setInterval(() => {
    io.emit("game_countdown", { countdown });
    countdown--;
    if (countdown < 0) {
      clearInterval(interval);
      startGame();
    }
  }, 1000);
}


// Функция старта игры
// Отправка сообщений о начале и завершении игры
function startGame() {
  if (gameActive) return;

  gameActive = true;
  crashPoint = 1.0;
  activeBets = {};
  targetCrashPoint = generateCrashMultiplier();
  console.log("🛫 Игра началась!");
  io.emit("game_start", { crashPoint }); // Отправляем сообщение о старте игры

  gameStartTime = new Date(); // Запоминаем время старта

  gameInterval = setInterval(() => {
    crashPoint += 0.01 * crashPoint;
    io.emit("game_update", { crashPoint });

    for (let player in activeBets) {
      if (activeBets[player].cashOutAt <= crashPoint) {
        let payout = activeBets[player].amount * activeBets[player].cashOutAt;
        io.to(player).emit("cash_out_success", { payout, multiplier: activeBets[player].cashOutAt });
        delete activeBets[player];
      }
    }

    if (crashPoint >= targetCrashPoint) {
      endGame();
    }
  }, 100);
}

// Функция завершения игры
async function endGame() {  // Сделай эту функцию асинхронной
  clearInterval(gameInterval);
  gameActive = false; // Завершаем текущую игру
  console.log(`💥 Игра завершена на коэффициенте ${targetCrashPoint.toFixed(2)}x`);

  io.emit("game_end", { crashPoint: targetCrashPoint }); // Отправляем сообщение о завершении игры

  await Game.create({  // Здесь используем await
    crashMultiplier: targetCrashPoint,
    startedAt: gameStartTime,
    endedAt: new Date(),
  });

  console.log("⏳ Новая игра начнется через 9 секунд...");
  io.emit("game_restart", { countdown: 9 }); // Отправляем сообщение о начале отсчета
  setTimeout(startGame, 9000); // ✅ Запускаем новый раунд через 9 секунд
  startCountdown();
}




// WebSocket-соединение
io.on("connection", (socket) => {
  console.log(`Игрок подключился: ${socket.id}`);

  socket.on("place_bet", async (data) => {
    if (!gameActive) {
      socket.emit("bet_error", { message: "Игра еще не началась" });
      return;
    }

    if (activeBets[socket.id]) {
      socket.emit("bet_error", { message: "Ставка уже сделана" });
      return;
    }

    if (data.amount <= 0) {
      socket.emit("bet_error", { message: "Некорректная сумма ставки" });
      return;
    }

    let player = await Player.findOne({ username: socket.id });

    if (!player) {
      player = await Player.create({ username: socket.id, balance: 1000 });
    }

    if (player.balance < data.amount) {
      socket.emit("bet_error", { message: "Недостаточно средств" });
      return;
    }

    player.balance -= data.amount;
    await player.save();

    const bet = await Bet.create({
      playerId: player._id,
      amount: data.amount,
    });

    activeBets[socket.id] = { amount: data.amount, cashOutAt: null };
    socket.emit("bet_success", { amount: data.amount });

    console.log(`🎲 Игрок ${socket.id} сделал ставку ${data.amount}`);
  });

  socket.on("cash_out", () => {
    if (!activeBets[socket.id]) {
      socket.emit("cash_out_error", { message: "Нет активной ставки" });
      return;
    }
    if (activeBets[socket.id].cashOutAt !== null) {
      socket.emit("cash_out_error", { message: "Вы уже забрали деньги" });
      return;
    }

    activeBets[socket.id].cashOutAt = crashPoint;
    console.log(`💰 Игрок ${socket.id} забрал деньги при ${crashPoint.toFixed(2)}x`);
  });

  socket.on("disconnect", () => {
    console.log(`Игрок отключился: ${socket.id}`);
    delete activeBets[socket.id];
  });

  // Отправляем обновления по коэффициенту в реальном времени
  socket.emit("game_update", { crashPoint });
});


// Запускаем сервер
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  startGame();
});

