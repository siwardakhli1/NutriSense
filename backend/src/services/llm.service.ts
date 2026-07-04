// ==========================================
// SERVICE - LLM (Mistral / OpenAI compatible) avec fallback règles
// Compatible avec l'API OpenAI-like utilisée par Mistral
// ==========================================
import { env } from '../config/env';
import { retrieveRelevantChunks } from './knowledge.service';

export interface AiResponse {
  answer: string;
  sources: string[];
  usedLLM: boolean;
}

interface UserContext {
  goal?: string;
  dietary?: string[];
  budget?: number;
  currentWeight?: number;
  targetWeight?: number;
}

/**
 * Construit le prompt système pour ancrer la réponse dans le contexte user + RAG.
 */
export function buildSystemPrompt(context: UserContext, chunks: ReturnType<typeof retrieveRelevantChunks>): string {
  const contextLines = [
    `Objectif utilisateur : ${context.goal || 'non défini'}`,
    context.dietary?.length ? `Régimes : ${context.dietary.join(', ')}` : null,
    context.budget ? `Budget hebdo : ${context.budget}€` : null,
    context.currentWeight ? `Poids actuel : ${context.currentWeight} kg` : null,
    context.targetWeight ? `Poids cible : ${context.targetWeight} kg` : null,
  ].filter(Boolean);

  const knowledgeContext = chunks
    .map((c, i) => `[Source ${i + 1} — ${c.source}]\n${c.content}`)
    .join('\n\n');

  return `Tu es NutriSense, un assistant nutritionnel bienveillant en français.

CONTEXTE UTILISATEUR :
${contextLines.join('\n')}

CONNAISSANCES PERTINENTES :
${knowledgeContext || 'Aucune source spécifique disponible.'}

CONSIGNES :
- Réponds en français, ton chaleureux mais précis
- Base ta réponse uniquement sur les sources fournies + contexte utilisateur
- Ne donne JAMAIS de conseil médical (diabète, pathologies, médicaments)
- Si la question sort de ton champ (nutrition/cuisine), redirige poliment
- Sois concis : 3-5 phrases max sauf demande d'explication détaillée
- Cite naturellement les sources quand pertinent (ex: "selon l'ANSES...")`;
}

/**
 * Appelle un LLM externe (Mistral, OpenAI...) ou tombe sur le fallback à règles.
 */
export async function generateAdvice(
  message: string,
  context: UserContext
): Promise<AiResponse> {
  const chunks = retrieveRelevantChunks(message, 3);
  const sources = chunks.map((c) => c.source);

  // Mode fallback : pas de clé API configurée
  if (env.LLM_PROVIDER === 'fallback' || !env.LLM_API_KEY) {
    return {
      answer: fallbackRuleBased(message, context, chunks),
      sources: sources.length ? sources : ['Base interne NutriSense'],
      usedLLM: false,
    };
  }

  // Appel LLM réel
  try {
    const systemPrompt = buildSystemPrompt(context, chunks);

    const response = await fetch(`${env.LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`LLM API status ${response.status}`);
    const json: any = await response.json();
    const answer = json.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error('Réponse vide du LLM');

    return {
      answer,
      sources,
      usedLLM: true,
    };
  } catch (err) {
    console.warn('[LLM] Fallback règles:', (err as Error).message);
    return {
      answer: fallbackRuleBased(message, context, chunks),
      sources: sources.length ? sources : ['Base interne NutriSense'],
      usedLLM: false,
    };
  }
}

/**
 * Fallback à règles si le LLM est indispo. Utilise quand même le RAG.
 */
export function fallbackRuleBased(
  message: string,
  context: UserContext,
  chunks: ReturnType<typeof retrieveRelevantChunks>
): string {
  // Si des chunks pertinents sont trouvés, on les résume
  if (chunks.length > 0) {
    const best = chunks[0];
    const goalMention = context.goal ? ` Pour votre objectif "${context.goal}",` : '';
    return `${best.content}${goalMention} pensez à adapter ces principes à votre situation. (source : ${best.source})`;
  }

  // Réponse générique par objectif
  const msg = message.toLowerCase();
  if (msg.includes('perdre') || msg.includes('poids') || msg.includes('maigrir')) {
    return "Pour une perte de poids durable : léger déficit calorique (300-500 kcal/j), protéines à chaque repas, éviter les sucres rapides et les boissons sucrées, activité physique régulière.";
  }
  if (msg.includes('muscle') || msg.includes('masse')) {
    return "Pour la prise de masse : surplus calorique modéré (+300 kcal), 1.6-2g de protéines/kg/jour, glucides autour des séances, sommeil de qualité.";
  }
  if (msg.includes('budget') || msg.includes('pas cher')) {
    return "Manger équilibré à petit budget : lentilles, œufs, riz, légumes surgelés, batch cooking le dimanche. Compter ~30€/semaine par personne.";
  }
  if (msg.includes('halal')) {
    return "Un menu halal équilibré : poulet, agneau, poissons, œufs, légumineuses, légumes et féculents complets. Vérifier les additifs des produits transformés.";
  }
  return `Pour votre objectif ${context.goal || 'santé'}, construisez chaque repas avec une source de protéines, une portion raisonnable de féculents (privilégier complets) et beaucoup de légumes.`;
}
