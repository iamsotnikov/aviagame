// src/components/Game.js или src/App.js
import { useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://85.209.134.201:3000");

function Game() {
  useEffect(() => {
    // Подключение к серверу
    socket.on("connect", () => {
      console.log("Подключено к серверу WebSocket!");
    });

    // Получаем обновления коэффициента
    socket.on("game_update", (data) => {
      console.log("Новый коэффициент:", data.crashPoint);
      // Обновляй состояние или интерфейс с новым коэффициентом
    });

    // Очистка при размонтировании компонента
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Игра</h1>
      {/* Отображение коэффициента */}
    </div>
  );
}

export default Game;

