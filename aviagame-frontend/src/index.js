import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Это наш стиль, сюда мы добавим подключение Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

