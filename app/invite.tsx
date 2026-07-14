// ==========================================
// SCREEN - Inviter un ami (parrainage)
// ==========================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
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


        {/* ===== MES RÉCOMPENSES ===== */}
        {(() => {
          const THRESHOLD = 5;
          const count = data?.invitedCount ?? 0;
          const unlocked = count >= THRESHOLD;
          const pct = Math.min(100, (count / THRESHOLD) * 100);
          const remaining = Math.max(0, THRESHOLD - count);
          return (
            <>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                Mes récompenses
              </Text>

              {/* Carte progression */}
              <View
                style={{
                  padding: Spacing.md,
                  borderRadius: BorderRadius.lg,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 14,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>Ta progression</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>
                    {count} / {THRESHOLD} amis
                  </Text>
                </View>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: 'hidden' }}>
                  <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.primary, width: `${pct}%` }} />
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
                  {unlocked
                    ? 'Récompense débloquée ! 🎉'
                    : `Plus que ${remaining} ami${remaining > 1 ? 's' : ''} pour débloquer 5 recettes premium 🍽️`}
                </Text>
              </View>

              {/* Carte palier 5 amis */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: Spacing.md,
                  borderRadius: BorderRadius.lg,
                  backgroundColor: colors.primaryLight,
                  borderWidth: 1,
                  borderColor: colors.primary,
                  marginBottom: Spacing.lg,
                }}
              >
                <View
                  style={{
                    width: 48, height: 48, borderRadius: 12,
                    backgroundColor: colors.surface,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ionicons name="restaurant" size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                      {THRESHOLD} amis
                    </Text>
                    <View style={{ backgroundColor: unlocked ? colors.primary : colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: unlocked ? '#fff' : colors.textSecondary }}>
                        {unlocked ? 'DÉBLOQUÉ' : 'ACTIF'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Débloque 5 recettes premium exclusives
                  </Text>
                </View>
              </View>
            </>
          );
        })()}

      </ScrollView>
    </SafeAreaView>
  );
}
