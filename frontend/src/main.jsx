import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import App from './App';
import './index.css';
import { startKeepAlive } from './utils/keepAlive';

startKeepAlive();

const ThemedToaster = () => {
  const { darkMode } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: darkMode ? '#1e293b' : '#fff',
          color: darkMode ? '#e2e8f0' : '#1e293b',
          borderRadius: '12px',
          boxShadow: darkMode
            ? '0 10px 40px rgba(0,0,0,0.3)'
            : '0 10px 40px rgba(0,0,0,0.12)',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#06b6d4', secondary: darkMode ? '#1e293b' : '#fff' } },
      }}
    />
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <ThemedToaster />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
