import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { WatchPage } from './watch/WatchPage';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root is missing');
}

const watch = window.location.pathname === '/watch' || window.location.pathname.startsWith('/watch/');

createRoot(root).render(
  <StrictMode>
    {watch ? <WatchPage /> : <App />}
  </StrictMode>,
);
