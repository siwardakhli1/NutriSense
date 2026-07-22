// ==========================================
// SWAGGER - Documentation API complète
// URL : /api/docs
// ==========================================
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Helper pour générer un endpoint documenté
function op(tag: string, summary: string, opts: any = {}) {
  const o: any = {
    tags: [tag],
    summary,
    responses: {
      '200': { description: 'Succès' },
      ...(opts.responses || {}),
    },
  };
  if (opts.auth !== false) o.security = [{ bearerAuth: [] }];
  if (opts.body) {
    o.requestBody = {
      required: true,
      content: { 'application/json': { schema: { type: 'object', properties: opts.body } } },
    };
  }
  if (opts.params) {
    o.parameters = opts.params.map((p: string) => ({
      name: p, in: 'path', required: true, schema: { type: 'string' },
    }));
  }
  if (opts.responses201) o.responses['201'] = { description: 'Créé' };
  if (opts.auth !== false) o.responses['401'] = { description: 'Non authentifié' };
  return o;
}

const S = (t: string) => ({ type: t });

const paths: any = {
  // ===== AUTHENTIFICATION =====
  '/api/auth/register': { post: op('Authentification', "Créer un compte", { auth: false, responses201: true, body: { name: S('string'), email: S('string'), password: S('string') } }) },
  '/api/auth/login': { post: op('Authentification', "Se connecter", { auth: false, body: { email: S('string'), password: S('string') } }) },
  '/api/auth/refresh': { post: op('Authentification', "Renouveler le jeton d'accès", { auth: false, body: { refreshToken: S('string') } }) },
  '/api/auth/logout': { post: op('Authentification', "Se déconnecter") },
  '/api/auth/me': {
    get: op('Authentification', "Récupérer l'utilisateur connecté"),
    put: op('Authentification', "Mettre à jour son profil", { body: { name: S('string') } }),
  },
  '/api/auth/complete-onboarding': { post: op('Authentification', "Terminer la configuration initiale") },
  '/api/auth/export': { get: op('Authentification', "Exporter ses données personnelles (RGPD)") },
  '/api/auth/account': { delete: op('Authentification', "Supprimer son compte (RGPD)") },
  '/api/auth/change-password': { post: op('Authentification', "Changer son mot de passe", { body: { currentPassword: S('string'), newPassword: S('string') } }) },
  '/api/auth/forgot-password': { post: op('Authentification', "Demander une réinitialisation du mot de passe", { auth: false, body: { email: S('string') } }) },
  '/api/auth/reset-password': { post: op('Authentification', "Réinitialiser le mot de passe", { auth: false, body: { code: S('string'), newPassword: S('string') } }) },
  '/api/auth/referral': { get: op('Authentification', "Récupérer son code de parrainage") },
  '/api/auth/redeem-invite': { post: op('Authentification', "Utiliser un code d'invitation", { body: { code: S('string') } }) },

  // ===== PLAN DE REPAS =====
  '/api/meals/generate': { post: op('Plan de repas', "Générer un plan de repas hebdomadaire") },
  '/api/meals/regenerate-from-today': { post: op('Plan de repas', "Régénérer le plan à partir d'aujourd'hui") },
  '/api/meals/current': { get: op('Plan de repas', "Récupérer le plan courant") },
  '/api/meals/all-recipes': { get: op('Plan de repas', "Récupérer toutes les recettes du plan") },
  '/api/meals/rescale': { post: op('Plan de repas', "Ré-échelonner le plan au nombre de personnes", { body: { people: S('number') } }) },

  // ===== RECETTES =====
  '/api/recipes': { get: op('Recettes', "Lister les recettes (filtres possibles)") },
  '/api/recipes/mine': {
    get: op('Recettes', "Lister mes recettes personnelles"),
    post: op('Recettes', "Créer une recette personnelle", { responses201: true, body: { name: S('string') } }),
  },
  '/api/recipes/mine/export': { get: op('Recettes', "Exporter mes recettes") },
  '/api/recipes/mine/import': { post: op('Recettes', "Importer des recettes") },
  '/api/recipes/mine/{id}': {
    put: op('Recettes', "Modifier une recette personnelle", { params: ['id'] }),
    delete: op('Recettes', "Supprimer une recette personnelle", { params: ['id'] }),
  },
  '/api/recipes/favorites/list': { get: op('Recettes', "Lister mes recettes favorites") },
  '/api/recipes/{id}': { get: op('Recettes', "Consulter une recette", { params: ['id'] }) },
  '/api/recipes/{id}/favorite': {
    post: op('Recettes', "Ajouter aux favoris", { params: ['id'] }),
    delete: op('Recettes', "Retirer des favoris", { params: ['id'] }),
  },

  // ===== CUISINE : FRIGO =====
  '/api/fridge/items': {
    get: op('Frigo', "Lister les ingrédients du frigo"),
    post: op('Frigo', "Ajouter un ingrédient", { body: { name: S('string'), expiresAt: S('string') } }),
  },
  '/api/fridge/items/{id}': { delete: op('Frigo', "Supprimer un ingrédient", { params: ['id'] }) },
  '/api/fridge/suggestions': { get: op('Frigo', "Suggestions à partir du frigo") },
  '/api/fridge/recommendations': { get: op('Frigo', "Recommandations de recettes") },

  // ===== CUISINE : COURSES =====
  '/api/shopping/current': { get: op('Courses', "Récupérer la liste de courses courante") },
  '/api/shopping/{listId}/items/{itemId}/toggle': { patch: op('Courses', "Cocher/décocher un article", { params: ['listId', 'itemId'] }) },

  // ===== NUTRITION / SCANNER =====
  '/api/nutrition/product/{barcode}': { get: op('Nutrition', "Informations d'un produit (code-barres)", { params: ['barcode'] }) },
  '/api/nutrition/product/{barcode}/alternatives': { get: op('Nutrition', "Alternatives à un produit", { params: ['barcode'] }) },
  '/api/nutrition/photo/analyze': { post: op('Nutrition', "Analyser une photo de repas") },
  '/api/nutrition/log': {
    post: op('Nutrition', "Enregistrer une consommation"),
    get: op('Nutrition', "Historique des consommations"),
  },
  '/api/nutrition/log/{id}': { delete: op('Nutrition', "Supprimer une consommation", { params: ['id'] }) },

  // ===== SUIVI / LOGS =====
  '/api/logs/nutrition': {
    post: op('Suivi', "Ajouter un journal nutritionnel"),
    get: op('Suivi', "Récupérer les journaux nutritionnels"),
  },
  '/api/logs/nutrition/{id}': { delete: op('Suivi', "Supprimer un journal", { params: ['id'] }) },
  '/api/logs/weight': { post: op('Suivi', "Enregistrer une pesée", { body: { weight: S('number') } }) },
  '/api/logs/water': { post: op('Suivi', "Enregistrer une consommation d'eau") },

  // ===== OBJECTIFS SANTÉ =====
  '/api/health-goals': { post: op('Santé', "Créer un objectif de santé", { body: { weight: S('number') } }) },
  '/api/health-goals/latest': { get: op('Santé', "Récupérer le dernier objectif") },

  // ===== STATISTIQUES =====
  '/api/analytics/dashboard': { get: op('Statistiques', "Tableau de bord complet (stats, insights, progression)") },
  '/api/analytics/daily': { get: op('Statistiques', "Statistiques journalières agrégées") },
  '/api/analytics/weight': { get: op('Statistiques', "Courbe de poids") },

  // ===== COACH =====
  '/api/ai/advice': { post: op('Coach', "Poser une question au coach nutritionnel", { body: { question: S('string') } }) },
  '/api/ai/history': {
    get: op('Coach', "Historique des échanges avec le coach"),
    delete: op('Coach', "Effacer l'historique du coach"),
  },

  // ===== PRÉFÉRENCES =====
  '/api/preferences': {
    get: op('Préférences', "Récupérer les préférences"),
    put: op('Préférences', "Mettre à jour les préférences"),
  },

  // ===== ADMINISTRATION =====
  '/api/admin/stats': { get: op('Administration', "Statistiques globales (admin)") },
  '/api/admin/users': { get: op('Administration', "Lister les utilisateurs (admin)") },
  '/api/admin/recipes': { get: op('Administration', "Lister les recettes (admin)") },
  '/api/admin/recipes/{id}': { delete: op('Administration', "Supprimer une recette (admin)", { params: ['id'] }) },
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NutriSense API',
      version: '3.0.0',
      description: 'API REST — projet fin d\'études Bac+5. Assistant nutritionnel avec RAG-lite, Open Food Facts, analytics, mode frigo, conformité RGPD.',
      contact: { name: 'Sirine' },
    },
    servers: [
      { url: 'https://nutrisense-2026.onrender.com', description: 'Production (Render)' },
      { url: 'http://localhost:3000', description: 'Développement local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
    paths,
    tags: [
      { name: 'Authentification', description: 'Comptes, connexion, RGPD, parrainage' },
      { name: 'Plan de repas', description: 'Génération et gestion du plan' },
      { name: 'Recettes', description: 'Consultation, création, favoris' },
      { name: 'Frigo', description: 'Gestion des ingrédients' },
      { name: 'Courses', description: 'Liste de courses' },
      { name: 'Nutrition', description: 'Scanner, produits, consommations' },
      { name: 'Suivi', description: 'Journaux et pesées' },
      { name: 'Santé', description: 'Objectifs de santé' },
      { name: 'Statistiques', description: 'Tableaux de bord et analyses' },
      { name: 'Coach', description: 'Assistant nutritionnel' },
      { name: 'Préférences', description: 'Réglages utilisateur' },
      { name: 'Administration', description: 'Gestion (admin uniquement)' },
    ],
  },
  apis: [],
};

export function setupSwagger(app: Express): void {
  const specs = swaggerJsdoc(options);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'NutriSense API Docs',
  }));
  app.get('/api/openapi.json', (_req, res) => res.json(specs));
  console.log('Swagger disponible : /api/docs');
}