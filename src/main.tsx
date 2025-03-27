import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { AdminProvider } from './components/admin/AdminContext';
import './index.css';

// Import global styles and fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Wait for the router to be ready
await router.load();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AdminProvider>
      <RouterProvider router={router} />
    </AdminProvider>
  </React.StrictMode>
);
