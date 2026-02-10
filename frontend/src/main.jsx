import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import { GOOGLE_CLIENT_ID } from './config/google.js';

// Global Styles
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Poppins', 'Lora', sans-serif;
    background-color: #ffffff;
    color: #0f172a;
    line-height: 1.5;
    font-size: 1rem;
    overflow-x: hidden;
    /* hide the browser page scrollbar while allowing inner scrollable areas */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', 'Lora', sans-serif;
    font-weight: 700;
    line-height: 1.2;
    color: #0f172a;
  }

  h1 { font-size: 1.875rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }

  p {
    color: #6b7280;
  }

  a {
    color: #AB2A02;
    text-decoration: none;
    transition: color 0.3s ease-in-out;
  }

  a:hover {
    color: #3E5626;
  }

  button {
    cursor: pointer;
    font-family: 'Poppins', 'Lora', sans-serif;
    border: none;
    transition: all 0.3s ease-in-out;
  }

  button:focus {
    outline: none;
  }

  input, textarea, select {
    font-family: 'Poppins', 'Lora', sans-serif;
    font-size: 1rem;
    color: #0f172a;
  }

  input::placeholder, textarea::placeholder {
    color: #6b7280;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
  }

  /* Hide default webkit scrollbars (page) */
  html::-webkit-scrollbar, body::-webkit-scrollbar, #root::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  /* Provide thin custom scrollbar for other scrollable elements if needed */
  .custom-scroll ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-scroll ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .custom-scroll ::-webkit-scrollbar-thumb {
    background: #3E5626;
    border-radius: 4px;
  }

  .custom-scroll ::-webkit-scrollbar-thumb:hover {
    background: #AB2A02;
  }

  ::selection {
    background-color: #3E5626;
    color: white;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
    }
  }
`;

// Inject global styles
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

// Import Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Lora:wght@400;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
