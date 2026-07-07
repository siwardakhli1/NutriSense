// ==========================================
// SCREEN - Inviter un ami (parrainage)
// ==========================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { api } from '@/services/api';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

interface ReferralData {
  referralCode: string;
  referralName: string;
  invitedCount: number;
  inviteLink: string;
}

export default function InviteScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get<ReferralData>('/auth/referral');
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    })();
  }, []);

  const handleShare = async () => {
    if (!data) return;
    const message = `Salut ! 👋

Je te partage NutriSense, l'app qui m'aide à planifier mes repas et gérer mon budget nutritionnel.

Utilise mon code pour t'inscrire : ${data.referralCode}

Ou clique directement : ${data.inviteLink}

À bientôt ! 🥗`;

    try {
      await Share.share({
        message,
        title: 'Rejoins-moi sur NutriSense',
      });
    } catch (e) {
      console.log('Share cancelled');
    }
  };

  const handleRedeem = async () => {
    if (!inputCode.trim()) {
      Alert.alert('Erreur', 'Entre un code');
      return;
    }
    setRedeeming(true);
    try {
      const res = await api.post<{ success: boolean; inviterName: string; message: string }>(
        '/auth/redeem-invite',
        { code: inputCode.trim() }
      );
      if (res.success && res.data) {
        Alert.alert('🎉 Bienvenue !', res.data.message, [
          { text: 'OK', onPress: () => setInputCode('') },
        ]);
      } else {
        Alert.alert('Erreur', res.message || 'Code invalide');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: colors.text, marginLeft: 8 }}>
          Inviter un ami
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}>
        {/* Bannière avec compteur */}
        <View
          style={{
            padding: Spacing.lg,
            borderRadius: BorderRadius.xl,
            backgroundColor: colors.primary,
            alignItems: 'center',
            marginBottom: Spacing.lg,
          }}
        >
          <Ionicons name="people" size={40} color="#fff" />
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 8 }}>
            {data?.invitedCount ?? 0}
          </Text>
          <Text style={{ fontSize: 13, color: '#fff', opacity: 0.9, marginTop: 2 }}>
            ami{(data?.invitedCount ?? 0) > 1 ? 's' : ''} déjà parrainé{(data?.invitedCount ?? 0) > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Section : Mon code */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Mon code de parrainage
        </Text>
        <View
          style={{
            padding: Spacing.lg,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.primaryLight,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: colors.primary,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 11, color: colors.textMuted, letterSpacing: 1 }}>
            TON CODE UNIQUE
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '900',
              color: colors.primary,
              letterSpacing: 2,
              marginTop: 8,
              marginBottom: 4,
            }}
            selectable={true}
          >
            {data?.referralCode || '—'}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
            Partage-le à tes amis pour les parrainer
          </Text>
        </View>

        {/* Bouton Partager */}
        <TouchableOpacity
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Partager mon code"
          style={{
            padding: 14,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: Spacing.lg,
          }}
        >
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
            Partager mon code
          </Text>
        </TouchableOpacity>

        {/* Section : Utiliser un code reçu */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Tu as reçu un code ?
        </Text>
        <View
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: Spacing.lg,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12, lineHeight: 18 }}>
            Un ami t'a partagé son code ? Entre-le ici pour le remercier :
          </Text>
          <TextInput
            value={inputCode}
            onChangeText={setInputCode}
            placeholder="Entre le code..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            style={{
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: BorderRadius.md,
              fontSize: 14,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 10,
            }}
          />
          <TouchableOpacity
            onPress={handleRedeem}
            disabled={redeeming || !inputCode.trim()}
            style={{
              padding: 12,
              borderRadius: BorderRadius.md,
              backgroundColor: inputCode.trim() ? colors.primary : colors.border,
              alignItems: 'center',
            }}
          >
            {redeeming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '800' }}>Valider le code</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Explication */}
        <View
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.lg,
            backgroundColor: colors.primaryLight,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
              Comment ça marche ?
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>
            1. Partage ton code à un ami{'\n'}
            2. Il s'inscrit sur NutriSense{'\n'}
            3. Il entre ton code dans "Inviter un ami"{'\n'}
            4. Vous êtes tous les deux dans la communauté 🎉
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
