import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <NotificationContainer />
      <App />
    </NotificationProvider>
  </StrictMode>,
)
