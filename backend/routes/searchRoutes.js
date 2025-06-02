import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Buscar productos
 *     tags: [Búsqueda]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: minPrecio
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrecio
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Resultados por página
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/', searchController.search);

/**
 * @swagger
 * /api/search/sync:
 *   post:
 *     summary: Sincronizar productos con Elasticsearch
 *     tags: [Búsqueda]
 *     responses:
 *       200:
 *         description: Productos sincronizados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/sync', searchController.syncProducts);

export default router;
