// ==========================================
// SWAGGER - Documentation API auto-générée
// URL : http://localhost:3000/api/docs
// ==========================================
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NutriSense API',
      version: '2.0.0',
      description: 'API REST — projet fin d\'études Bac+5. Assistant nutritionnel avec RAG-lite, Open Food Facts, analytics, mode frigo, conformité RGPD.',
      contact: { name: 'Sirine' },
    },
    servers: [{ url: 'http://localhost:3000', description: 'Développement local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export function setupSwagger(app: Express): void {
  const specs = swaggerJsdoc(options);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'NutriSense API Docs',
  }));
  app.get('/api/openapi.json', (_req, res) => res.json(specs));
  console.log('📖 Swagger disponible : http://localhost:3000/api/docs');
}
