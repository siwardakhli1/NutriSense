// ==========================================
// SCREEN - Reset password (code reçu par email + nouveau mdp)
// ==========================================
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }
    if (code.length !== 6) {
      Alert.alert('Erreur', 'Le code doit faire 6 chiffres');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit faire au moins 8 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    const res = await api.post('/auth/reset-password', { email, code, newPassword });
    setLoading(false);

    if (res.success) {
      Alert.alert(
        '✅ Mot de passe réinitialisé',
        'Tu peux maintenant te connecter avec ton nouveau mot de passe.',
        [{ text: 'Se connecter', onPress: () => router.replace('/(auth)/login') }]
      );
    } else {
      Alert.alert('Erreur', res.message || 'Code invalide ou expiré');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nouveau mot de passe',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: colors.primaryLight,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 14, color: colors.textMuted,
              textAlign: 'center', marginTop: 12, paddingHorizontal: 20,
            }}>
              Entre le code à 6 chiffres reçu par email et choisis un nouveau mot de passe.
            </Text>
          </View>

          <Card>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: BorderRadius.md,
                paddingHorizontal: 14, paddingVertical: 12,
                color: colors.text, fontSize: 15,
                marginBottom: 12,
              }}
            />

            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
              Code de vérification (6 chiffres)
            </Text>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: BorderRadius.md,
                paddingHorizontal: 14, paddingVertical: 14,
                color: colors.text,
                fontSize: 22, fontWeight: '800',
                letterSpacing: 6, textAlign: 'center',
                marginBottom: 16,
              }}
            />

            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
              Nouveau mot de passe
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              placeholder="8 caractères minimum"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: BorderRadius.md,
                paddingHorizontal: 14, paddingVertical: 12,
                color: colors.text, fontSize: 15,
                marginBottom: 12,
              }}
            />

            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
              Confirmer
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder="Retape le mot de passe"
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: BorderRadius.md,
                paddingHorizontal: 14, paddingVertical: 12,
                color: colors.text, fontSize: 15,
              }}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18} color={colors.textMuted}
              />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {showPassword ? 'Masquer' : 'Afficher'} les mots de passe
              </Text>
            </TouchableOpacity>
          </Card>

          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            style={{
              backgroundColor: colors.primary,
              padding: 16, borderRadius: BorderRadius.md,
              alignItems: 'center', marginTop: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                Réinitialiser mon mot de passe
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
