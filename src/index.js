import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

function registerServiceWorker() {
  // Check for service worker support in the browser
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/serviceWorker.js`)
      .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
      }).catch(error => {
          console.log('Service Worker registration failed:', error);
      });
  }
}

registerServiceWorker();