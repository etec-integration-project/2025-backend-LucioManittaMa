import { searchProducts, syncAllProducts } from '../services/search/productSearchService.js';

/**
 * Busca productos
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 */
export const search = async (req, res) => {
  try {
    const { q, categoria, minPrecio, maxPrecio, page = 1, limit = 10 } = req.query;
    
    const results = await searchProducts({
      query: q,
      categoria,
      minPrecio: minPrecio ? parseFloat(minPrecio) : undefined,
      maxPrecio: maxPrecio ? parseFloat(maxPrecio) : undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
    
    res.json({
      success: true,
      data: results.products,
      meta: {
        total: results.total,
        page: parseInt(page, 10),
        totalPages: results.totalPages,
        limit: parseInt(limit, 10)
      },
      suggestions: results.suggestions
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      error: 'Error al realizar la búsqueda',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Sincroniza todos los productos con Elasticsearch
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 */
export const syncProducts = async (req, res) => {
  try {
    const result = await syncAllProducts();
    res.json({
      success: true,
      message: `Sincronizados ${result.count} productos con Elasticsearch`
    });
  } catch (error) {
    console.error('Error sincronizando productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al sincronizar productos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  search,
  syncProducts
};
