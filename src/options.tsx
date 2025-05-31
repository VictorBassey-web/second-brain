import React from 'react';
import { createRoot } from 'react-dom/client';
import OptionsPage from './components/OptionsPage';
import './styles/globals.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <OptionsPage />
    </React.StrictMode>
  );
} 