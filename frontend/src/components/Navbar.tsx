import { ShoppingBag, Menu, Search, Heart, LogIn, UserCircle, LogOut, ChevronDown, Shield, Settings, Package, ShoppingCart, Tag } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../store/useCart';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems = useCart((state) => state.items);
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAdminButtonClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <button className="p-2 rounded-md lg:hidden">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-green-800">U·RBAN</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-800">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-green-800">Productos</Link>
          </div>

          <div className="flex items-center space-x-6">
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="Search sneakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button type="submit" className="ml-2">
                <Search className="h-5 w-5 text-gray-500" />
              </button>
            </form>

            <Link to="/favorites" className="relative">
              <Heart className="h-6 w-6 text-gray-600" />
            </Link>
            
            <Link to="/cart" className="relative">
              <ShoppingBag className="h-6 w-6 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={menuRef}>
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 relative">
                    <Link to="/account" className="flex items-center space-x-2 text-gray-700 hover:text-green-800">
                      <UserCircle className="h-6 w-6" />
                      <span className="hidden md:inline">{user.nombre}</span>
                    </Link>
                    {user.rol === 'admin' && (
                      <div className="relative">
                        <button
                          onClick={handleAdminButtonClick}
                          className="flex items-center space-x-2 text-gray-700 hover:text-green-800 focus:outline-none"
                        >
                          <Shield className="h-6 w-6" />
                          <span className="hidden md:inline">Admin</span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 block">
                            <Link
                              to="/admin/productos/lista"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Gestionar Productos
                            </Link>
                            <Link
                              to="/admin/ordenes"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Gestionar Órdenes
                            </Link>
                            <Link
                              to="/admin/categories"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Tag className="h-4 w-4 mr-2" />
                              Gestionar Categorías
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-800"
                  >
                    <LogOut className="h-6 w-6" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}