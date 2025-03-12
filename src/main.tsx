import React from 'react';
import ReactDOM from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import registerServiceWorker from '@/client/registerServiceWorker.ts';
import Home from '@/App.tsx';
import '@radix-ui/themes/styles.css';
import './index.css';

const root = document.getElementById('root')!;
registerServiceWorker().then(
  () => ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Theme
        accentColor="mint"
        appearance="dark"
        grayColor="gray"
        panelBackground="solid"
        radius="large"
        scaling="100%">
        <Home />
      </Theme>
    </React.StrictMode>,
  )
).catch(() => root.innerText = 'Failed to load service worker.');