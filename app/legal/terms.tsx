// ==========================================
// SCREEN - Conditions Générales d'Utilisation
// ==========================================
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Spacing, FontSize } from '@/constants/Colors';

export default function TermsScreen() {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: colors.text, marginLeft: 8 }}>
          Conditions d'utilisation
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: Spacing.lg, fontStyle: 'italic' }}>
          Dernière mise à jour : Juillet 2026
        </Text>

        <Section title="1. Objet">
          <Paragraph>
            Les présentes conditions générales régissent l'utilisation de l'application NutriSense, une application mobile de planification nutritionnelle et de suivi de repas.
          </Paragraph>
          <Paragraph>
            En utilisant NutriSense, tu acceptes ces conditions dans leur intégralité.
          </Paragraph>
        </Section>

        <Section title="2. Utilisation autorisée">
          <Paragraph>
            NutriSense est destinée à un usage personnel et non commercial. Tu t'engages à :
          </Paragraph>
          <Paragraph>
            • Ne pas utiliser l'app à des fins illégales ou nuisibles{'\n'}
            • Ne pas tenter d'accéder aux données d'autres utilisateurs{'\n'}
            • Ne pas dégrader le service (attaques, saturation){'\n'}
            • Ne pas reproduire, revendre ou modifier l'app{'\n'}
            • Respecter les droits d'auteur (recettes, images, textes)
          </Paragraph>
        </Section>

        <Section title="3. Compte utilisateur">
          <Paragraph>
            Tu es responsable de la confidentialité de ton mot de passe et de toute activité sur ton compte. Il est de ta responsabilité de nous prévenir en cas de compromission.
          </Paragraph>
          <Paragraph>
            Un seul compte par personne. Les comptes multiples ou fictifs sont interdits.
          </Paragraph>
        </Section>

        <Section title="4. Contenu">
          <Paragraph>
            Les recettes, conseils nutritionnels et suggestions fournis par NutriSense sont donnés à titre <Text style={{ fontWeight: '700' }}>informatif</Text> et ne remplacent en aucun cas l'avis d'un professionnel de santé.
          </Paragraph>
          <Paragraph>
            Consulte un médecin ou nutritionniste avant tout changement significatif de régime alimentaire, notamment en cas de grossesse, allergie ou pathologie.
          </Paragraph>
        </Section>

        <Section title="5. Disponibilité">
          <Paragraph>
            Nous nous efforçons de maintenir NutriSense accessible 24h/24, mais ne garantissons pas une disponibilité continue. Des interruptions pour maintenance ou incidents techniques peuvent survenir.
          </Paragraph>
        </Section>

        <Section title="6. Propriété intellectuelle">
          <Paragraph>
            L'application NutriSense, son design, son code, ses fonctionnalités et son contenu (hors contributions utilisateur) sont protégés par le droit d'auteur.
          </Paragraph>
        </Section>

        <Section title="7. Responsabilité">
          <Paragraph>
            NutriSense est fournie "en l'état". Nous ne pouvons être tenus responsables de dommages liés à l'usage de l'app ou aux décisions nutritionnelles prises sur la base des conseils fournis.
          </Paragraph>
        </Section>

        <Section title="8. Résiliation">
          <Paragraph>
            Tu peux supprimer ton compte à tout moment depuis <Text style={{ fontWeight: '700' }}>Profil {'>'} Confidentialité {'>'} Supprimer mon compte</Text>. Cette action est irréversible.
          </Paragraph>
          <Paragraph>
            Nous nous réservons le droit de suspendre un compte en cas de violation des présentes conditions.
          </Paragraph>
        </Section>

        <Section title="9. Modifications">
          <Paragraph>
            Nous pouvons modifier ces conditions à tout moment. Toute modification substantielle te sera notifiée par email ou dans l'app.
          </Paragraph>
        </Section>

        <Section title="10. Droit applicable">
          <Paragraph>
            Ces conditions sont soumises au droit français. Tout litige sera de la compétence exclusive des tribunaux français.
          </Paragraph>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
