// ==========================================
// SERVICE - Base de connaissances nutritionnelle (RAG-lite)
// Sources : recommandations ANSES/PNNS, principes nutritionnels de base
// ==========================================
import { cosineSimilarity, textToVector } from '../utils/helpers';

interface KnowledgeChunk {
  id: string;
  topic: string;
  content: string;
  source: string;
  tags: string[];
}


export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: 'k1',
    topic: 'Perte de poids',
    content: 'Pour perdre du poids durablement, viser un déficit calorique modéré de 300-500 kcal par jour. Maintenir un apport protéique élevé (1.6-2g/kg) pour préserver la masse musculaire. Prioriser les aliments à faible densité énergétique : légumes, protéines maigres, féculents complets. Éviter les régimes drastiques (< 1200 kcal/j) qui provoquent effet yoyo.',
    source: 'ANSES - Actualisation repères alimentaires 2019',
    tags: ['perte', 'poids', 'régime', 'maigrir', 'déficit', 'calories'],
  },
  {
    id: 'k2',
    topic: 'Prise de masse musculaire',
    content: 'Pour la prise de masse : surplus calorique de 200-400 kcal/jour, apport protéique de 1.6 à 2.2g par kg de poids corporel réparti sur 4 repas. Cibler des glucides complexes autour des séances (avant et après entraînement). Sommeil de 7-9h essentiel pour la récupération et synthèse protéique.',
    source: 'International Society of Sports Nutrition (ISSN) position stand',
    tags: ['muscle', 'masse', 'prise', 'sport', 'musculation', 'protéines'],
  },
  {
    id: 'k3',
    topic: 'Manger équilibré petit budget',
    content: 'Base économique équilibrée : légumineuses (lentilles, pois chiches, haricots secs) à 0.5-1€/kg comme source protéique. Œufs (excellent rapport protéines/prix). Légumes surgelés (aussi nutritifs que frais). Batch cooking le dimanche. Éviter plats préparés et snacks industriels qui coûtent 3-5x plus cher au kg.',
    source: 'Guide PNNS - Manger équilibré à petit budget',
    tags: ['budget', 'économique', 'pas cher', 'étudiant', 'batch cooking'],
  },
  {
    id: 'k4',
    topic: 'Hydratation',
    content: 'Besoins hydriques : 30-35 ml/kg/jour soit environ 1.5 à 2.5L. Augmenter par temps chaud (+500ml/jour) ou activité physique (+500ml par heure de sport). Répartir sur la journée. Le thé et café comptent pour 50% de leur volume. Éviter jus de fruits (sucres) et sodas.',
    source: 'EFSA - European Food Safety Authority',
    tags: ['eau', 'hydratation', 'boire', 'boisson'],
  },
  {
    id: 'k5',
    topic: 'Alimentation halal équilibrée',
    content: 'Un régime halal complet et équilibré est facile à composer : poulet, dinde, agneau, bœuf halal, poissons, œufs, légumineuses, produits laitiers, tous fruits et légumes, céréales complètes. Aucun nutriment n\'est difficile à obtenir. Attention aux additifs contenant de l\'alcool ou gélatine porcine dans les produits transformés.',
    source: 'Guide PNNS + certification AVS/AVS Halal',
    tags: ['halal', 'islam', 'musulman', 'ramadan'],
  },
  {
    id: 'k6',
    topic: 'Alimentation végétarienne/végane',
    content: 'Régime végétal équilibré : associer céréales + légumineuses pour protéines complètes. Supplémentation vitamine B12 indispensable en végane (10-25 μg/jour). Surveiller fer, zinc, oméga-3 (lin, chia, noix). Le tofu, tempeh, seitan sont d\'excellentes sources protéiques. 25-40g de fibres/jour visés.',
    source: 'Academy of Nutrition and Dietetics - Position on Vegetarian Diets',
    tags: ['végétarien', 'végétarienne', 'végane', 'vegan', 'végétal', 'b12'],
  },
  {
    id: 'k7',
    topic: 'Fibres alimentaires',
    content: 'Objectif : 25-30g de fibres par jour (moyenne française : 18g). Sources : légumes secs (10-15g/100g), légumes verts, fruits avec peau, céréales complètes, oléagineux. Bénéfices : satiété, transit, microbiote, glycémie. Augmenter progressivement pour éviter inconfort digestif.',
    source: 'ANSES - Références nutritionnelles adultes',
    tags: ['fibres', 'transit', 'microbiote', 'satiété', 'digestion'],
  },
  {
    id: 'k8',
    topic: 'Glucides et index glycémique',
    content: 'Privilégier les glucides à IG bas ou modéré : légumineuses, avoine, quinoa, riz basmati, patate douce, pâtes al dente, pain complet au levain. Éviter les IG très élevés (pain blanc, riz blanc collant, corn flakes) surtout hors contexte sportif. L\'association avec fibres, protéines et lipides abaisse l\'IG global du repas.',
    source: 'INSERM - Index glycémique et santé',
    tags: ['glucides', 'sucre', 'glycémie', 'diabète', 'ig'],
  },
  {
    id: 'k9',
    topic: 'Batch cooking',
    content: 'Principe : 2-3h de cuisine le dimanche pour préparer 5-6 repas de la semaine. Cuire en grande quantité les féculents (riz, quinoa, pâtes) et protéines (poulet, œufs durs, tofu). Préparer 2-3 sauces polyvalentes. Assembler des bowls différents chaque jour. Conservation 4 jours au frigo, congélation possible.',
    source: 'PNNS - Techniques anti-gaspillage',
    tags: ['batch', 'meal prep', 'préparation', 'anti-gaspi', 'organisation'],
  },
  {
    id: 'k10',
    topic: 'Petit-déjeuner',
    content: 'Un bon petit-déjeuner combine : source de protéines (œufs, yaourt grec, fromage blanc, skyr), glucides complexes (flocons d\'avoine, pain complet), fruit frais, lipides de qualité (oléagineux, avocat). Éviter céréales sucrées industrielles et jus de fruits en berlingot. Le petit-déjeuner n\'est pas indispensable si vous n\'avez pas faim.',
    source: 'PNNS - Repères pour adultes',
    tags: ['petit-déjeuner', 'matin', 'breakfast'],
  },
];

// Vocabulaire construit à partir de tous les tags + mots-clés principaux
const VOCABULARY = Array.from(
  new Set(
    KNOWLEDGE_BASE.flatMap((k) =>
      [...k.tags, ...k.topic.toLowerCase().split(/\s+/), ...k.content.toLowerCase().split(/[^a-zàâäéèêëïîôöùûüç]+/)]
    ).filter((w) => w.length > 3)
  )
);

/**
 * RAG-lite : trouve les k chunks les plus pertinents pour une question.
 * En prod : remplacer par pgvector + embeddings OpenAI/Cohere/HuggingFace.
 */
export function retrieveRelevantChunks(question: string, k = 3): KnowledgeChunk[] {
  const questionVec = textToVector(question, VOCABULARY);
  const scored = KNOWLEDGE_BASE.map((chunk) => {
    const chunkText = `${chunk.topic} ${chunk.tags.join(' ')} ${chunk.content}`;
    const chunkVec = textToVector(chunkText, VOCABULARY);
    return {
      chunk,
      score: cosineSimilarity(questionVec, chunkVec),
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter((s) => s.score > 0.05)
    .map((s) => s.chunk);
}
