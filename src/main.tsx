import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './app/App';
import { applyPalette, getPalette } from './features/appearance/palette';

applyPalette(getPalette()); // before the first paint, so there is no flash of paper

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
