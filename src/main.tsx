import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import { App } from './app/App';
// After App, so the look's rules come after every component's own styles.
import './styles/elevenlabs.css';
import { applyPalette, getPalette } from './features/appearance/palette';

applyPalette(getPalette()); // before the first paint, so there is no flash of the wrong colours

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
