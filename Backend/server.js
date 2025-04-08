/**
 * @fileoverview Punto de entrada para iniciar el servidor.
 */

import app from './app.js';
import { PORT } from './config/dotenv.js';

/**
 * Inicia el servidor en el puerto especificado.
 */
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
