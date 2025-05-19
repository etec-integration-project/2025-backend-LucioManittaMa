import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="530806533254-t8d93e0ogi08afrivnlrnk3k48qppuu2.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);