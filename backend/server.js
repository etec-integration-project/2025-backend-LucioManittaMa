import express from 'express';
import { connectDB } from './config/db.js';
import { corsMiddleware } from './controllers/corsMiddleware.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

connectDB().catch((error) => {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1); // Salir si no se puede conectar
  });

const app = express();

// Registrar el middleware de CORS
app.use(corsMiddleware);

// Configuración para parsear JSON
app.use(express.json());

// Registrar las rutas
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
