import esClient from '../../config/elasticsearch.js';
import { Product } from '../../models/product.js';

const INDEX_NAME = process.env.ELASTICSEARCH_INDEX_PRODUCTS || 'products';

/**
 * Crea el índice de productos en Elasticsearch si no existe
 */
async function createProductIndex() {
  try {
    const exists = await esClient.indices.exists({ index: INDEX_NAME });
    
    if (!exists) {
      await esClient.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              nombre: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' },
                  spanish: { 
                    type: 'text',
                    analyzer: 'spanish'
                  }
                }
              },
              descripción: { 
                type: 'text',
                analyzer: 'spanish'
              },
              precio: { type: 'float' },
              categoría: { type: 'keyword' },
              imagen: { type: 'keyword' },
              // Agregar más campos según sea necesario
            }
          },
          settings: {
            analysis: {
              analyzer: {
                spanish: {
                  type: 'spanish',
                  tokenizer: 'standard',
                  filter: [
                    'lowercase',
                    'spanish_stop',
                    'spanish_stemmer'
                  ]
                }
              },
              filter: {
                spanish_stop: {
                  type: 'stop',
                  stopwords: '_spanish_'
                },
                spanish_stemmer: {
                  type: 'stemmer',
                  language: 'light_spanish'
                }
              }
            }
          }
        }
      });
      console.log(`Índice ${INDEX_NAME} creado correctamente`);
    }
  } catch (error) {
    console.error('Error creando el índice en Elasticsearch:', error);
    throw error;
  }
}

/**
 * Indexa un producto en Elasticsearch
 * @param {Object} product - Producto a indexar
 */
async function indexProduct(product) {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: product.product_id.toString(),
      body: {
        nombre: product.nombre,
        descripción: product.descripción || '',
        precio: parseFloat(product.precio) || 0,
        categoría: product.categoría || 'sin-categoria',
        imagen: product.imagen || '',
        // Agregar más campos según sea necesario
      },
      refresh: true // Para que esté disponible inmediatamente
    });
    console.log(`Producto ${product.product_id} indexado correctamente`);
  } catch (error) {
    console.error('Error indexando producto:', error);
    throw error;
  }
}

/**
 * Elimina un producto del índice
 * @param {number} productId - ID del producto a eliminar
 */
async function deleteProductFromIndex(productId) {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: productId.toString()
    });
    console.log(`Producto ${productId} eliminado del índice`);
  } catch (error) {
    if (error.meta?.statusCode !== 404) { // No es un error si el producto no existía
      console.error('Error eliminando producto del índice:', error);
      throw error;
    }
  }
}

/**
 * Busca productos en Elasticsearch
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.query - Término de búsqueda
 * @param {string} params.categoria - Filtrar por categoría
 * @param {number} params.minPrecio - Precio mínimo
 * @param {number} params.maxPrecio - Precio máximo
 * @param {number} params.page - Página actual
 * @param {number} params.limit - Resultados por página
 * @returns {Promise<Object>} Resultados de la búsqueda
 */
async function searchProducts({ query, categoria, minPrecio, maxPrecio, page = 1, limit = 10 }) {
  try {
    const from = (page - 1) * limit;
    
    const must = [];
    const filter = [];
    
    // Búsqueda por texto
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: [
            'nombre^3',       // Más peso al nombre
            'nombre.spanish', // Búsqueda en español
            'descripción'     // Menos peso a la descripción
          ],
          fuzziness: 'AUTO',  // Búsqueda difusa para manejar errores de escritura
          operator: 'and'     // Todas las palabras deben coincidir
        }
      });
    }
    
    // Filtros
    if (categoria) {
      filter.push({ term: { 'categoría.keyword': categoria } });
    }
    
    if (minPrecio !== undefined || maxPrecio !== undefined) {
      const range = {};
      if (minPrecio !== undefined) range.gte = parseFloat(minPrecio);
      if (maxPrecio !== undefined) range.lte = parseFloat(maxPrecio);
      filter.push({ range: { precio: range } });
    }
    
    const body = {
      query: {
        bool: {
          must: must.length > 0 ? must : [{ match_all: {} }],
          filter: filter.length > 0 ? filter : []
        }
      },
      // Sugerencias para búsqueda
      suggest: {
        text: query,
        didYouMean: {
          phrase: {
            field: 'nombre.spanish',
            size: 1,
            direct_generator: [{
              field: 'nombre.spanish',
              suggest_mode: 'always',
              min_word_length: 3
            }]
          }
        }
      },
      // Resaltado de términos de búsqueda
      highlight: {
        fields: {
          nombre: {},
          descripción: {}
        }
      },
      // Ordenación (por defecto por relevancia)
      sort: [
        { _score: { order: 'desc' } },
        { 'nombre.keyword': 'asc' }
      ],
      // Paginación
      from,
      size: limit
    };

    const { body: result } = await esClient.search({
      index: INDEX_NAME,
      body
    });

    // Procesar resultados
    const products = result.hits.hits.map(hit => ({
      ...hit._source,
      id: hit._id,
      highlight: hit.highlight
    }));

    // Sugerencias de búsqueda
    const suggestions = [];
    if (result.suggest?.didYouMean?.[0]?.options?.length > 0) {
      suggestions.push({
        text: result.suggest.didYouMean[0].options[0].text,
        score: result.suggest.didYouMean[0].options[0].score
      });
    }

    return {
      products,
      total: result.hits.total.value,
      suggestions,
      page,
      totalPages: Math.ceil(result.hits.total.value / limit)
    };
  } catch (error) {
    console.error('Error buscando productos:', error);
    throw error;
  }
}

/**
 * Sincroniza todos los productos de MySQL a Elasticsearch
 */
async function syncAllProducts() {
  try {
    await createProductIndex();
    const products = await Product.findAll();
    
    for (const product of products) {
      await indexProduct(product);
    }
    
    console.log(`Sincronizados ${products.length} productos con Elasticsearch`);
    return { success: true, count: products.length };
  } catch (error) {
    console.error('Error sincronizando productos:', error);
    throw error;
  }
}

export {
  createProductIndex,
  indexProduct,
  deleteProductFromIndex,
  searchProducts,
  syncAllProducts
};
