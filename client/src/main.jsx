import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { io } from 'socket.io-client';
import App from './App.jsx';
import './index.css';

// Подключаемся к WebSocket серверу
const socket = io('https://aviagame.onrender.com/');

const Main = () => {
  const [messages, setMessages] = useState([]);
  const [telegramUser, setTelegramUser] = useState(null);

  useEffect(() => {
    // Получаем данные от Telegram Mini App
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) {
        setTelegramUser(user);
        socket.emit('telegram_auth', { initData: window.Telegram.WebApp.initData });
      }
    }

    // Слушаем сообщения от WebSocket
    socket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (telegramUser) {
      socket.emit('message', `${telegramUser.first_name}: Привет от Telegram Mini App!`);
    } else {
      alert("Ошибка: Telegram данные не загружены!");
    }
  };

  return (
    <div>
      <h1>WebSocket + Telegram</h1>
      {telegramUser ? (
        <div>
          <p>Вы вошли как: {telegramUser.first_name}</p>
          <button onClick={sendMessage}>Отправить сообщение</button>
        </div>
      ) : (
        <p>Загрузка данных от Telegram...</p>
      )}
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
