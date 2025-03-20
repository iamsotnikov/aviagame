import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

function App() {
  const [balance, setBalance] = useState(0);
  const [playerId, setPlayerId] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [player, setPlayer] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [crashPoint, setCrashPoint] = useState(1.0);
  const [activeBet, setActiveBet] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Устанавливаем соединение с сервером WebSocket
    const newSocket = io("http://85.209.134.201:3000");
    setSocket(newSocket);

    // Логируем успешное подключение
    newSocket.on("connect", () => {
      console.log("WebSocket подключен");
    });

    // Обработчик обновлений коэффициента краша
    newSocket.on("game_update", (data) => {
      console.log("Получен новый коэффициент:", data);
      setCrashPoint(data.crashPoint); // Обновляем коэффициент
    });

    // Обработчик успешной ставки
    newSocket.on("bet_success", (data) => {
      console.log("Ставка успешна:", data);
      setBalance(data.balance); // Обновляем баланс после ставки
      setActiveBet({ amount: data.amount });
    });

    // Обработчик ошибки ставки
    newSocket.on("bet_error", (error) => {
      console.error("Ошибка при ставке:", error);
      alert(error.message); // Выводим ошибку, если не удалось поставить
    });

    // Логируем отключение WebSocket
    newSocket.on("disconnect", () => {
      console.log("WebSocket отключен");
    });

    return () => newSocket.close(); // Закрываем соединение при размонтировании
  }, []);

  const getBalance = async () => {
    try {
      const response = await axios.get("http://85.209.134.201:3000/get_balance", {
        params: { playerId },
      });
      console.log("Баланс получен:", response.data.balance);
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Ошибка при получении баланса:", error);
    }
  };

  const registerPlayer = async () => {
    if (!playerId) {
      alert("Введите playerId!");
      return;
    }

    try {
      const telegramId = "exampleTelegramId"; // Временно задаем telegramId
      const response = await axios.post("http://85.209.134.201:3000/register", {
        playerId,
        telegramId,
      });
      setPlayer(response.data.player);
      setIsRegistered(true);
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
    }
  };

  const startGame = () => {
    if (socket) {
      socket.emit("start_game");
      setGameStarted(true);
    }
  };

  const placeBet = () => {
    if (!gameStarted) {
      alert("Игра не началась!");
      return;
    }

    if (betAmount <= 0 || betAmount > balance) {
      alert("Неверная сумма ставки");
      return;
    }

    socket.emit("place_bet", { amount: betAmount });
  };

  const cashOut = () => {
    if (activeBet) {
      socket.emit("cash_out");
    } else {
      alert("Вы не поставили ставку!");
    }
  };

  useEffect(() => {
    if (playerId) {
      getBalance();
    }
  }, [playerId]);

  return (
    <div className="App">
      <h1>AVIAJET 🚀</h1>

      {isRegistered ? (
        <div>
          <h2>Добро пожаловать, {player.username}!</h2>
          <h2>Баланс: {balance}₽</h2>
          {gameStarted ? (
            <div>
              <h3>Игра началась! Коэффициент: {crashPoint}x</h3>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Введите ставку"
              />
              <button onClick={placeBet}>Сделать ставку</button>
              <button onClick={cashOut}>Вывести деньги</button>
            </div>
          ) : (
            <button onClick={startGame}>Начать игру</button>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Введите playerId"
          />
          <button onClick={registerPlayer}>Зарегистрировать игрока</button>
        </div>
      )}
    </div>
  );
}

export default App;

