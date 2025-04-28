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
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middlewares
app.use(corsMiddleware);
app.use(express.json());

// Servir archivos estáticos (debe ir antes de las rutas)
app.use('/uploads', express.static(uploadsDir));

// Conexión a la base de datos
await connectDB().catch((error) => {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1);
});

// Rutas
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => res.json({ message: 'API funcionando correctamente' }));

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
