import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#06b6d4', secondary: '#fff' } },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
