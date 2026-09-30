import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './routes/ScrollToTop';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <ScrollToTop />
          <App />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 2800,
              style: {
                background: '#0c1220',
                color: '#f1f5f9',
                border: '1px solid #1e293b',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
                borderRadius: '8px',
                fontSize: '12px',
                padding: '10px 14px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#0c1220' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0c1220' },
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
