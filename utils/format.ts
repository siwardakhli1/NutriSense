// ==========================================
// UTILS - Fonctions utilitaires pures (frontend)
// Testables sans dépendance à React ou Expo
// ==========================================

/**
 * Formate un email en minuscules et trim
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Vérifie qu'un email a un format valide
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Vérifie la force d'un mot de passe (min 8 caractères)
 */
export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8;
}

/**
 * Formate un prix en euros avec 2 décimales
 * Ex: 12.5 → "12.50 €"
 */
export function formatPrice(price: number, currency: string = '€'): string {
  if (typeof price !== 'number' || isNaN(price)) return `0.00 ${currency}`;
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Formate un nombre de calories avec l'unité
 * Ex: 450 → "450 kcal"
 */
export function formatCalories(kcal: number): string {
  const value = Math.round(kcal || 0);
  return `${value} kcal`;
}

/**
 * Formate un temps en minutes en "1h30" ou "45 min"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes < 0) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Calcule le pourcentage utilisé du budget
 */
export function budgetUsagePercent(spent: number, budget: number): number {
  if (!budget || budget <= 0) return 0;
  const percent = (spent / budget) * 100;
  return Math.min(Math.max(0, Math.round(percent)), 100);
}

/**
 * Retourne la couleur d'un Nutri-Score
 */
export function nutriScoreColor(score: string): string {
  const colors: Record<string, string> = {
    A: '#00A651',
    B: '#8CC63F',
    C: '#FFCC33',
    D: '#F58220',
    E: '#E63946',
  };
  return colors[score?.toUpperCase()] || '#999999';
}

/**
 * Retourne le label d'un objectif utilisateur
 */
export function goalLabel(goal: string): string {
  const labels: Record<string, string> = {
    healthy: 'Manger sain',
    fast: 'Rapide',
    budget: 'Économique',
    muscle: 'Prise de masse',
  };
  return labels[goal] || goal;
}

/**
 * Calcule le BMR selon Mifflin-St Jeor
 * Formule : (10 × poids) + (6.25 × taille) - (5 × âge) + 5 (H) ou -161 (F)
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  isMale: boolean = true
): number {
  if (!weight || !height || !age) return 0;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(isMale ? base + 5 : base - 161);
}

/**
 * Applique le facteur d'activité au BMR
 * Ex: sédentaire × 1.2, modéré × 1.55, intense × 1.9
 */
export function tdeeFromBMR(bmr: number, activityLevel: 'low' | 'medium' | 'high'): number {
  const factors = { low: 1.2, medium: 1.55, high: 1.9 };
  return Math.round(bmr * factors[activityLevel]);
}

/**
 * Retourne la classification IMC
 */
export function bmiCategory(weight: number, heightCm: number): string {
  if (!weight || !heightCm) return 'inconnu';
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  if (bmi < 18.5) return 'maigreur';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'surpoids';
  return 'obésité';
}

/**
 * Tronque une chaîne à N caractères et ajoute "..."
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Retourne un index de jour de la semaine (0=lundi, 6=dimanche) pour une date ISO
 */
export function dayIndexFromDate(isoDate: string): number {
  const d = new Date(isoDate);
  const jsDay = d.getDay(); // 0=dimanche
  return jsDay === 0 ? 6 : jsDay - 1;
}
