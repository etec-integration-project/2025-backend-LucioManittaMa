import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del cliente de Elasticsearch
const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  // En producción, usa autenticación:
  // auth: {
  //   username: process.env.ELASTICSEARCH_USERNAME,
  //   password: process.env.ELASTICSEARCH_PASSWORD
  // }
  // Para desarrollo con seguridad deshabilitada, no se necesita autenticación
});

export default esClient;
