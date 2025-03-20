import React from 'react';

function MainScreen({ onStartGame }) {
  return (
    <div className="container text-center mt-5">
      <h1>AVIAJET 🚀</h1>
      <p>Нажмите "Играть" для начала!</p>
      <button className="btn btn-primary" onClick={onStartGame}>
        Играть
      </button>
    </div>
  );
}

export default MainScreen;

