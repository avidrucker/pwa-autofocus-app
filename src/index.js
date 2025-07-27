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
      // Wait for the page to load before registering
      window.addEventListener('load', () => {
          navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/serviceWorker.js`)
          .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
              
              // Check for updates
              registration.addEventListener('updatefound', () => {
                  const newWorker = registration.installing;
                  if (newWorker) {
                      newWorker.addEventListener('statechange', () => {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('New service worker available, consider refreshing.');
                          }
                      });
                  }
              });
          }).catch(error => {
              console.log('Service Worker registration failed:', error);
          });
      });
  } else {
      console.log('Service Worker not supported in this browser');
  }
}

registerServiceWorker();