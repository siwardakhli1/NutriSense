// ==========================================
// SCREEN - Politique de confidentialité (RGPD)
// ==========================================
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Spacing, FontSize } from '@/constants/Colors';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
        {title}
      </Text>
      <View>{children}</View>
    </View>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 }}>
      {children}
    </Text>
  );

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6, paddingLeft: 4 }}>
      <Text style={{ color: colors.primary, fontWeight: '800' }}>•</Text>
      <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>
        {children}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: colors.text, marginLeft: 8 }}>
          Politique de confidentialité
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: Spacing.lg, fontStyle: 'italic' }}>
          Dernière mise à jour : Juillet 2026
        </Text>

        <Section title="1. Qui sommes-nous ?">
          <Paragraph>
            NutriSense est une application mobile développée dans le cadre d'un projet étudiant. Nous sommes responsables du traitement de tes données personnelles.
          </Paragraph>
        </Section>

        <Section title="2. Quelles données collectons-nous ?">
          <Paragraph>Pour te fournir nos services, nous collectons :</Paragraph>
          <Bullet><Text style={{ fontWeight: '700' }}>Données d'identification</Text> : nom, adresse email</Bullet>
          <Bullet><Text style={{ fontWeight: '700' }}>Données de préférences</Text> : budget, objectif santé, régime alimentaire</Bullet>
          <Bullet><Text style={{ fontWeight: '700' }}>Données de santé</Text> : poids, historique alimentaire (uniquement si tu les saisis)</Bullet>
          <Bullet><Text style={{ fontWeight: '700' }}>Données techniques</Text> : logs de connexion, langue préférée</Bullet>
          <Paragraph>
            <Text style={{ fontWeight: '700' }}>Nous ne collectons PAS</Text> : géolocalisation, contacts, photos hors caméra explicite.
          </Paragraph>
        </Section>

        <Section title="3. Pourquoi ces données ?">
          <Bullet>Créer et gérer ton compte (base légale : contrat)</Bullet>
          <Bullet>Générer ton plan de repas personnalisé (base légale : contrat)</Bullet>
          <Bullet>Suivre ta progression nutritionnelle (base légale : consentement)</Bullet>
          <Bullet>Améliorer nos services (base légale : intérêt légitime)</Bullet>
          <Bullet>Répondre aux obligations légales (base légale : obligation légale)</Bullet>
        </Section>

        <Section title="4. Combien de temps ?">
          <Paragraph>
            Tes données sont conservées <Text style={{ fontWeight: '700' }}>tant que ton compte est actif</Text>. Après suppression de ton compte, toutes tes données sont effacées définitivement <Text style={{ fontWeight: '700' }}>sous 30 jours</Text>.
          </Paragraph>
          <Paragraph>
            Les logs techniques (sécurité) sont conservés <Text style={{ fontWeight: '700' }}>12 mois maximum</Text> conformément aux recommandations de la CNIL.
          </Paragraph>
        </Section>

        <Section title="5. Qui a accès à tes données ?">
          <Paragraph>
            Tes données restent <Text style={{ fontWeight: '700' }}>strictement confidentielles</Text>. Elles sont hébergées en <Text style={{ fontWeight: '700' }}>Union Européenne</Text> et ne sont partagées avec aucun tiers.
          </Paragraph>
          <Paragraph>
            Sous-traitants techniques : hébergeur (Neon.tech), CDN, service d'IA (Mistral AI - Europe). Aucun ne peut lire tes données personnelles identifiables.
          </Paragraph>
        </Section>

        <Section title="6. Tes droits RGPD">
          <Paragraph>À tout moment, tu peux exercer les droits suivants :</Paragraph>
          <Bullet><Text style={{ fontWeight: '700' }}>Droit d'accès</Text> (art. 15) : voir tes données</Bullet>
          <Bullet><Text style={{ fontWeight: '700' }}>Droit de rectification</Text> (art. 16) : corriger tes données</Bullet>
          <Bullet><Text style={{ fontWeight: '700' }}>Droit à l'effacement</Text> (art. 17) : supprimer ton compte</Bullet>
          <Bullet><Text style={{ fontWeight: '700' }}>Droit à la portabilité</Text> (art. 20) : exporter tes données au format JSON</Bullet>
          <Bullet><Text style={{ fontWeight: '700' }}>Droit d'opposition</Text> (art. 21) : t'opposer à certains traitements</Bullet>
          <Paragraph>
            Ces droits sont accessibles directement depuis l'écran <Text style={{ fontWeight: '700' }}>Profil {'>'} Confidentialité</Text>.
          </Paragraph>
        </Section>

        <Section title="7. Sécurité">
          <Paragraph>
            Nous appliquons les standards OWASP Top 10 : mots de passe hashés (bcrypt), tokens JWT à expiration courte, connexion HTTPS obligatoire, protection anti brute-force, audit des dépendances.
          </Paragraph>
        </Section>

        <Section title="8. Réclamations">
          <Paragraph>
            Si tu estimes que tes droits ne sont pas respectés, tu peux déposer une réclamation auprès de la <Text style={{ fontWeight: '700' }}>CNIL</Text> : www.cnil.fr
          </Paragraph>
        </Section>

        <Section title="9. Contact">
          <Paragraph>
            Pour toute question relative à tes données personnelles : contact@nutrisense.app
          </Paragraph>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
