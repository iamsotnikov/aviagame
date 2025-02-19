import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://aviagame.onrender.com"); // Подключение к бекенду

const App = () => {
  const [username, setUsername] = useState(null);
  const [authStatus, setAuthStatus] = useState("Загрузка данных от Telegram...");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    console.log("🔍 Telegram WebApp API:", tg);
    console.log("🔍 initDataUnsafe:", tg?.initDataUnsafe);

    if (tg && tg.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      setUsername(user.first_name);
      setAuthStatus(`Привет, ${user.first_name}!`);

      // Отправляем данные в бекенд
      socket.emit("telegram_auth", { initData: tg.initData });

      console.log("📡 Отправлены данные в WebSocket:", tg.initData);
    } else {
      setAuthStatus("❌ Ошибка: Не удалось загрузить данные Telegram.");
      console.log("❌ Ошибка: Telegram WebApp не найден или initData пуст.");
    }
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Avia Game</h1>
      <p>{authStatus}</p>
      <button onClick={() => alert("Начать игру!")}>Начать игру</button>
    </div>
  );
};

export default App;
