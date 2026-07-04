// ==========================================
// TESTS - Fonctions utilitaires frontend
// Tests unitaires purs, sans React ni Expo
// ==========================================
import {
  normalizeEmail,
  isValidEmail,
  isValidPassword,
  formatPrice,
  formatCalories,
  formatDuration,
  budgetUsagePercent,
  nutriScoreColor,
  goalLabel,
  calculateBMR,
  tdeeFromBMR,
  bmiCategory,
  truncate,
  dayIndexFromDate,
} from '../format';

describe('normalizeEmail', () => {
  it("met en minuscules et trim", () => {
    expect(normalizeEmail('  Sirine@Example.COM  ')).toBe('sirine@example.com');
  });

  it("gère un email déjà propre", () => {
    expect(normalizeEmail('test@test.fr')).toBe('test@test.fr');
  });
});

describe('isValidEmail', () => {
  it("accepte les emails valides", () => {
    expect(isValidEmail('test@test.com')).toBe(true);
    expect(isValidEmail('sirine.dakhli@gmail.com')).toBe(true);
    expect(isValidEmail('a+b@c.co')).toBe(true);
  });

  it("refuse les emails invalides", () => {
    expect(isValidEmail('pas-un-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@test.com')).toBe(false);
    expect(isValidEmail('test @test.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it("refuse les types non-string", () => {
    // @ts-expect-error tests invalides voulus
    expect(isValidEmail(null)).toBe(false);
    // @ts-expect-error
    expect(isValidEmail(undefined)).toBe(false);
    // @ts-expect-error
    expect(isValidEmail(123)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it("accepte les mots de passe de 8+ caractères", () => {
    expect(isValidPassword('motdepasse123')).toBe(true);
    expect(isValidPassword('12345678')).toBe(true);
  });

  it("refuse les mots de passe trop courts", () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });
});

describe('formatPrice', () => {
  it("formate avec 2 décimales et €", () => {
    expect(formatPrice(12.5)).toBe('12.50 €');
    expect(formatPrice(3)).toBe('3.00 €');
    expect(formatPrice(0)).toBe('0.00 €');
  });

  it("gère une devise custom", () => {
    expect(formatPrice(10, '$')).toBe('10.00 $');
  });

  it("gère les valeurs invalides", () => {
    expect(formatPrice(NaN)).toBe('0.00 €');
    // @ts-expect-error test invalide voulu
    expect(formatPrice(undefined)).toBe('0.00 €');
  });
});

describe('formatCalories', () => {
  it("arrondit et ajoute kcal", () => {
    expect(formatCalories(450)).toBe('450 kcal');
    expect(formatCalories(432.7)).toBe('433 kcal');
    expect(formatCalories(0)).toBe('0 kcal');
  });

  it("gère les valeurs manquantes", () => {
    // @ts-expect-error
    expect(formatCalories(undefined)).toBe('0 kcal');
    // @ts-expect-error
    expect(formatCalories(null)).toBe('0 kcal');
  });
});

describe('formatDuration', () => {
  it("affiche en minutes si < 60", () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(15)).toBe('15 min');
  });

  it("affiche en heures pile si multiple de 60", () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
  });

  it("affiche en heures + minutes sinon", () => {
    expect(formatDuration(90)).toBe('1h30');
    expect(formatDuration(75)).toBe('1h15');
    expect(formatDuration(125)).toBe('2h05');
  });

  it("gère 0 et valeurs négatives", () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(-5)).toBe('0 min');
  });
});

describe('budgetUsagePercent', () => {
  it("calcule le pourcentage utilisé", () => {
    expect(budgetUsagePercent(50, 100)).toBe(50);
    expect(budgetUsagePercent(75, 100)).toBe(75);
    expect(budgetUsagePercent(0, 100)).toBe(0);
  });

  it("plafonne à 100", () => {
    expect(budgetUsagePercent(150, 100)).toBe(100);
    expect(budgetUsagePercent(200, 50)).toBe(100);
  });

  it("gère un budget zéro ou négatif", () => {
    expect(budgetUsagePercent(50, 0)).toBe(0);
    expect(budgetUsagePercent(50, -10)).toBe(0);
  });

  it("plancher à 0 pour dépense négative", () => {
    expect(budgetUsagePercent(-10, 100)).toBe(0);
  });
});

describe('nutriScoreColor', () => {
  it("renvoie la bonne couleur pour chaque score", () => {
    expect(nutriScoreColor('A')).toBe('#00A651');
    expect(nutriScoreColor('B')).toBe('#8CC63F');
    expect(nutriScoreColor('C')).toBe('#FFCC33');
    expect(nutriScoreColor('D')).toBe('#F58220');
    expect(nutriScoreColor('E')).toBe('#E63946');
  });

  it("est insensible à la casse", () => {
    expect(nutriScoreColor('a')).toBe('#00A651');
    expect(nutriScoreColor('e')).toBe('#E63946');
  });

  it("renvoie une couleur par défaut pour un score inconnu", () => {
    expect(nutriScoreColor('X')).toBe('#999999');
    expect(nutriScoreColor('')).toBe('#999999');
  });
});

describe('goalLabel', () => {
  it("mappe les objectifs vers leur libellé", () => {
    expect(goalLabel('healthy')).toBe('Manger sain');
    expect(goalLabel('fast')).toBe('Rapide');
    expect(goalLabel('budget')).toBe('Économique');
    expect(goalLabel('muscle')).toBe('Prise de masse');
  });

  it("renvoie l'objectif brut si non mappé", () => {
    expect(goalLabel('other')).toBe('other');
  });
});

describe('calculateBMR', () => {
  it("calcule le BMR pour un homme", () => {
    // Homme, 70kg, 175cm, 25 ans
    // BMR = 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    expect(calculateBMR(70, 175, 25, true)).toBe(1674);
  });

  it("calcule le BMR pour une femme", () => {
    // Femme, 60kg, 165cm, 30 ans
    // BMR = 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
    expect(calculateBMR(60, 165, 30, false)).toBe(1320);
  });

  it("renvoie 0 pour des valeurs manquantes", () => {
    expect(calculateBMR(0, 175, 25)).toBe(0);
    expect(calculateBMR(70, 0, 25)).toBe(0);
    expect(calculateBMR(70, 175, 0)).toBe(0);
  });
});

describe('tdeeFromBMR', () => {
  it("applique le bon facteur d'activité", () => {
    expect(tdeeFromBMR(1500, 'low')).toBe(1800);       // × 1.2
    expect(tdeeFromBMR(1500, 'medium')).toBe(2325);    // × 1.55
    expect(tdeeFromBMR(1500, 'high')).toBe(2850);      // × 1.9
  });

  it("arrondit le résultat", () => {
    const val = tdeeFromBMR(1673, 'medium');
    expect(Number.isInteger(val)).toBe(true);
  });
});

describe('bmiCategory', () => {
  it("classe correctement les IMC", () => {
    expect(bmiCategory(45, 170)).toBe('maigreur');    // IMC 15.6
    expect(bmiCategory(65, 170)).toBe('normal');      // IMC 22.5
    expect(bmiCategory(78, 170)).toBe('surpoids');    // IMC 27.0
    expect(bmiCategory(100, 170)).toBe('obésité');    // IMC 34.6
  });

  it("gère les valeurs manquantes", () => {
    expect(bmiCategory(0, 170)).toBe('inconnu');
    expect(bmiCategory(70, 0)).toBe('inconnu');
  });
});

describe('truncate', () => {
  it("laisse les strings courtes intactes", () => {
    expect(truncate('Bonjour', 20)).toBe('Bonjour');
  });

  it("tronque les strings longues et ajoute ...", () => {
    expect(truncate('Ceci est un texte long', 10)).toBe('Ceci est u...');
  });

  it("gère les strings vides ou undefined", () => {
    expect(truncate('', 10)).toBe('');
    // @ts-expect-error
    expect(truncate(undefined, 10)).toBe('');
  });
});

describe('dayIndexFromDate', () => {
  it("renvoie 0 pour un lundi", () => {
    // 2026-07-06 = lundi
    expect(dayIndexFromDate('2026-07-06')).toBe(0);
  });

  it("renvoie 6 pour un dimanche", () => {
    // 2026-07-05 = dimanche
    expect(dayIndexFromDate('2026-07-05')).toBe(6);
  });

  it("renvoie l'index correct au milieu de semaine", () => {
    // 2026-07-08 = mercredi
    expect(dayIndexFromDate('2026-07-08')).toBe(2);
  });
});
