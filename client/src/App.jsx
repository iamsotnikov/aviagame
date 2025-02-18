import React from 'react';

const App = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Avia Game</h1>
      <p>Добро пожаловать в Avia Game!</p>
      <button onClick={() => alert('Начать игру!')}>Начать игру</button>
    </div>
  );
};

export default App;
