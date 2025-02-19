import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://aviagame.onrender.com"); // Адрес твоего бэкенда

const App = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");

  useEffect(() => {
    console.log("window.Telegram:", window.Telegram);
    console.log("window.Telegram.WebApp:", window.Telegram?.WebApp);
    console.log("window.Telegram.WebApp.initDataUnsafe:", window.Telegram?.WebApp?.initDataUnsafe);

    // Проверяем, доступен ли объект Telegram
    if (window.Telegram?.WebApp) {
      console.log("✅ Telegram WebApp API найден");
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
      console.log("initDataUnsafe:", initDataUnsafe);

      if (initDataUnsafe?.user) {
        setUser(initDataUnsafe.user);
        console.log("👤 Пользователь:", initDataUnsafe.user);

        // Отправляем данные авторизации на сервер
        socket.emit("telegram_auth", { initData: initDataUnsafe });
      } else {
        console.log("⚠️ Данные Telegram отсутствуют");
      }
    } else {
      console.log("❌ Telegram WebApp API не найден");
    }

    // Обработка сообщений с сервера
    socket.on("message", (data) => {
      setReceivedMessage(data);
      console.log("📩 Сообщение от сервера:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Avia Game</h1>
      {user ? (
        <p>Привет, {user.first_name}!</p>
      ) : (
        <p>Загрузка данных от Telegram...</p>
      )}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Введите сообщение"
      />
      <button onClick={sendMessage}>Отправить сообщение</button>
      {receivedMessage && <p>Ответ от сервера: {receivedMessage}</p>}
    </div>
  );
};

export default App;
