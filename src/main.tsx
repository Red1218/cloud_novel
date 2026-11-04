import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import { App } from './app/App';
// After App, so the look's rules come after every component's own styles.
import './styles/elevenlabs.css';
import { syncStatusBar } from './features/appearance/palette';
import { forgetOldBookSettings } from './features/reader/hooks/useReaderEnvironment';

syncStatusBar();
forgetOldBookSettings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
