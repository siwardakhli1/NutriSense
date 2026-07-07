// ==========================================
// SCREEN - Confidentialité (RGPD)
// Export données + Suppression compte + Liens légaux
// ==========================================
import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { AuthContext } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const [exporting, setExporting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // ==========================================
  // EXPORT DES DONNÉES (RGPD art. 20)
  // ==========================================
  const handleExport = async () => {
    setExporting(true);
    try {
      console.log('[Export] Début de la requête...');
      const res = await api.get<any>('/auth/export');
      console.log('[Export] Réponse:', res.success, res.error, res.message);

      if (!res.success) {
        Alert.alert('Erreur', res.message || 'Impossible de récupérer les données');
        return;
      }

      if (!res.data) {
        Alert.alert('Erreur', 'Aucune donnée reçue du serveur');
        return;
      }

      const jsonString = JSON.stringify(res.data, null, 2);
      console.log('[Export] JSON généré, taille:', jsonString.length, 'caractères');

      // Si trop gros, on affiche juste un résumé
      if (jsonString.length > 50000) {
        Alert.alert(
          'Export généré',
          `Tes données représentent ${Math.round(jsonString.length / 1024)} Ko. Le partage va s'ouvrir.`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Partager',
              onPress: async () => {
                try {
                  await Share.share({
                    message: jsonString.substring(0, 50000) + '\n\n... (données tronquées, contact-nous pour l\'export complet)',
                    title: 'Mes données NutriSense',
                  });
                } catch (e: any) {
                  console.log('[Export] Erreur Share:', e.message);
                  Alert.alert('Partage annulé');
                }
              },
            },
          ]
        );
      } else {
        try {
          await Share.share({
            message: jsonString,
            title: 'Mes données NutriSense (RGPD)',
          });
        } catch (shareErr: any) {
          console.log('[Export] Erreur Share:', shareErr.message);
          Alert.alert('Partage annulé', 'Le partage a été annulé.');
        }
      }
    } catch (e: any) {
      console.log('[Export] Erreur:', e.message);
      Alert.alert('Erreur', `Une erreur est survenue : ${e.message || 'inconnue'}`);
    } finally {
      setExporting(false);
    }
  };

  // ==========================================
  // SUPPRESSION DU COMPTE (RGPD art. 17)
  // ==========================================
  const handleDelete = async () => {
    if (confirmText !== 'SUPPRIMER') {
      Alert.alert('Erreur', 'Tape SUPPRIMER pour confirmer');
      return;
    }
    setDeleting(true);
    try {
      const res = await api.delete('/auth/account');
      if (res.success) {
        Alert.alert(
          'Compte supprimé',
          'Toutes tes données ont été effacées définitivement.',
          [{ text: 'OK', onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }}]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer le compte');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={{ padding: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: colors.text, marginLeft: 8 }}>
          Confidentialité
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}>
        {/* Intro RGPD */}
        <View
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.primaryLight,
            marginBottom: Spacing.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
              Tes données t'appartiennent
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
            Conformément au RGPD, tu peux exporter ou supprimer tes données à tout moment.
          </Text>
        </View>

        {/* Section 1 : Export */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Droit à la portabilité (Article 20)
        </Text>
        <TouchableOpacity
          onPress={handleExport}
          disabled={exporting}
          accessibilityRole="button"
          accessibilityLabel="Exporter mes données"
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: Spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="download-outline" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
              Exporter mes données
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Télécharge un fichier JSON avec toutes tes données
            </Text>
          </View>
          {exporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          )}
        </TouchableOpacity>

        {/* Section 2 : Liens légaux */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Informations légales
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/legal/privacy')}
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
          <Text style={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' }}>
            Politique de confidentialité
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/legal/terms')}
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: Spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Ionicons name="book-outline" size={22} color={colors.textSecondary} />
          <Text style={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' }}>
            Conditions générales d'utilisation
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Section 3 : Suppression */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Zone dangereuse
        </Text>
        <TouchableOpacity
          onPress={() => setDeleteModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Supprimer mon compte"
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: '#FEE2E2',
            borderWidth: 1,
            borderColor: '#FCA5A5',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#FCA5A5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trash-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#B91C1C' }}>
              Supprimer mon compte
            </Text>
            <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 2 }}>
              Action irréversible - toutes tes données seront perdues
            </Text>
          </View>
        </TouchableOpacity>

        {/* Modal confirmation suppression */}
        {deleteModalVisible && (
          <View
            style={{
              marginTop: Spacing.lg,
              padding: Spacing.md,
              borderRadius: BorderRadius.lg,
              backgroundColor: '#FEF2F2',
              borderWidth: 2,
              borderColor: '#EF4444',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#B91C1C', marginBottom: 8 }}>
              ⚠️ Confirmer la suppression
            </Text>
            <Text style={{ fontSize: 13, color: '#7F1D1D', marginBottom: 12, lineHeight: 18 }}>
              Cette action est <Text style={{ fontWeight: '800' }}>irréversible</Text>. Toutes tes données (repas, historique, préférences, favoris) seront supprimées définitivement.
            </Text>
            <Text style={{ fontSize: 12, color: '#7F1D1D', marginBottom: 6, fontWeight: '600' }}>
              Tape SUPPRIMER pour confirmer :
            </Text>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="SUPPRIMER"
              placeholderTextColor="#FCA5A5"
              autoCapitalize="characters"
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: BorderRadius.md,
                fontSize: 14,
                fontWeight: '700',
                color: '#B91C1C',
                borderWidth: 1,
                borderColor: '#FCA5A5',
                marginBottom: 12,
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => { setDeleteModalVisible(false); setConfirmText(''); }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: BorderRadius.md,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#FCA5A5',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#B91C1C', fontWeight: '700' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleting || confirmText !== 'SUPPRIMER'}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: BorderRadius.md,
                  backgroundColor: confirmText === 'SUPPRIMER' ? '#EF4444' : '#FCA5A5',
                  alignItems: 'center',
                }}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '800' }}>
                    Supprimer définitivement
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
