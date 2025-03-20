import React, { useState } from 'react';

function BettingScreen({ balance, onPlaceBet }) {
  const [betAmount, setBetAmount] = useState(0);

  const handleBetChange = (e) => {
    setBetAmount(e.target.value);
  };

  const handlePlaceBet = () => {
    if (betAmount <= balance) {
      onPlaceBet(betAmount);
    } else {
      alert("Недостаточно средств");
    }
  };

  return (
    <div className="container text-center mt-5">
      <h3>Баланс: ${balance}</h3>
      <input
        type="number"
        className="form-control"
        value={betAmount}
        onChange={handleBetChange}
        placeholder="Введите ставку"
      />
      <button className="btn btn-primary mt-2" onClick={handlePlaceBet}>
        Сделать ставку
      </button>
    </div>
  );
}

export default BettingScreen;


