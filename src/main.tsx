import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import '@fontsource-variable/caveat';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/journey.css';
import './styles/nature.css';
import './styles/trail.css';
import { App } from './app/App';
import { useSettings } from './state/settings';
import { detectLang } from './i18n';
import { loadContent } from './content';
import { loadMapData } from './map/geo';

// first visit: pick the language from ?lang= or the browser; later visits keep the saved choice unless ?lang= says otherwise
let firstVisit = true;
try {
  firstVisit = !localStorage.getItem('puravida:settings');
} catch {
  firstVisit = true;
}
if (firstVisit) useSettings.getState().setLang(detectLang());
else {
  const q = new URLSearchParams(window.location.search).get('lang') || new URLSearchParams(window.location.hash.split('?')[1] || '').get('lang');
  if (q === 'en' || q === 'es' || q === 'zh') useSettings.getState().setLang(q);
}
document.documentElement.lang = useSettings.getState().lang;
// pages cross with a view transition where the browser has them; elsewhere the page's own enter animation runs
if ('startViewTransition' in document) document.documentElement.classList.add('has-vt');

// warm the content and map data once the first paint is out of the way (they are needed by most routes)
const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 400));
idle(() => { loadContent().catch(() => undefined); loadMapData().catch(() => undefined); });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
