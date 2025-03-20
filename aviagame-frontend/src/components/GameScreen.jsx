import React, { useState, useEffect } from 'react';

function GameScreen({ multiplier, onCashOut }) {
  return (
    <div className="container text-center mt-5">
      <h1>Игровой экран</h1>
      <p>Множитель: {multiplier}x</p>
      <button className="btn btn-success" onClick={onCashOut}>
        Вывести
      </button>
    </div>
  );
}

export default GameScreen;

