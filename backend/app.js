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
import { errorHandler } from './controllers/errorHandler.js';

const app = express();

connectDB().catch((error) => {
  console.error('Error al conectar a la base de datos:', error.message);
  process.exit(1);
});

app.use(corsMiddleware);
app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/test', (req, res) => res.json({ message: 'API funcionando correctamente' }));

app.use(errorHandler);

export default app;
