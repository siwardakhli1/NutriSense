// ==========================================
// COMPONENT - OnboardingLayout
// Layout commun aux 3 pages d'onboarding
// ==========================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Button } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

interface OnboardingLayoutProps {
  step: number;        // 1, 2, 3
  totalSteps: number;  // 3
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBack?: boolean;
  bottomHint?: string;
}

export function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = 'Suivant',
  nextDisabled = false,
  nextLoading = false,
  showBack = true,
  bottomHint,
}: OnboardingLayoutProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const progress = (step / totalSteps) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* HEADER : Back + Progress */}
      <View
        style={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {showBack && step > 1 ? (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Retour"
            accessibilityHint="Revenir à l'étape précédente"
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        {/* Progress bar */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.border,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: colors.primary,
                borderRadius: 3,
              }}
            />
          </View>
        </View>

        {/* Step counter */}
        <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600', minWidth: 30 }}>
          {step}/{totalSteps}
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.lg,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre + sous-titre */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: colors.text,
              marginBottom: 8,
              lineHeight: 34,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 15, color: colors.textMuted, lineHeight: 22 }}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Contenu spécifique de l'étape */}
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </ScrollView>

      {/* FOOTER : Bouton + hint */}
      <View
        style={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.md,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        {bottomHint && (
          <Text
            style={{
              textAlign: 'center',
              color: colors.textMuted,
              fontSize: 13,
              marginBottom: 10,
            }}
          >
            {bottomHint}
          </Text>
        )}
        {onNext && (
          <Button
            title={nextLabel}
            onPress={onNext}
            disabled={nextDisabled}
            loading={nextLoading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
