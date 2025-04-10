import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './controllers/errorHandler.js';
import { authMiddleware } from './controllers/authMiddleware.js';
import { getAllProducts } from './controllers/productsController.js';

const app = express();

// Conexión a la base de datos
connectDB().catch((error) => {
  console.error('Error al conectar a la base de datos:', error.message);
  process.exit(1); // Salir si no se puede conectar
});
// Middlewares globales
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:81', // Dirección del frontend
  credentials: true, // Permitir cookies y encabezados de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));

// Manejar solicitudes preflight (OPTIONS)
app.options('*', cors());

// Rutas públicas
app.use('/api/auth', authRoutes);

// Ruta GET de productos (pública)
app.get('/api/products', getAllProducts);

// Middleware de autenticación para rutas protegidas
app.use('/api/products', authMiddleware, productRoutes); // Cambio aquí
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/reviews', authMiddleware, reviewRoutes);

// Agregar esta ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
