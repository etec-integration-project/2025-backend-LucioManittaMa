import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundart';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary fallback={<div>Ha ocurrido un error. Por favor, recarga la página.</div>}>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <AppRoutes />
            </main>
            <Toaster position="top-right" />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;