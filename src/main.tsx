import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

// Auto-register PWA service worker safely outside of sandboxed preview iframes
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.self === window.top) {
    window.addEventListener('load', () => {
      const swPath = './sw.js';
      navigator.serviceWorker.register(swPath).catch((err) => {
        console.log('PWA SW registration skipped:', err);
      });
    });
  }
} catch {
  // Ignore in sandboxed or restricted iframe preview
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('Fatal: #root element not found in DOM');
}
