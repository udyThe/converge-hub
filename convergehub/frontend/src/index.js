// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client' instead of 'react-dom'
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root using createRoot
root.render(
    <React.StrictMode>
            <App />
    </React.StrictMode>
);
