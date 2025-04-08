import { Routes, Route, Navigate } from 'react-router-dom';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Products from '../pages/Products';
import AdminProducts from '../pages/AdminProducts';
import Cart from '../pages/Cart';
import Favorites from '../pages/Favorites';
import Account from '../pages/Account';
import Checkout from '../pages/Checkout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export default function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/admin/productos" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
} 