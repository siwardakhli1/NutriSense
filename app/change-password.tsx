// ==========================================
// SCREEN - Changement de mot de passe (utilisateur connecté)
// ==========================================
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
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
    if (currentPassword === newPassword) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setLoading(true);
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    setLoading(false);

    if (res.success) {
      Alert.alert(
        '✅ Mot de passe modifié',
        'Ton mot de passe a été mis à jour. Tu vas être déconnectée pour te reconnecter avec le nouveau.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } else {
      Alert.alert('Erreur', res.message || 'Impossible de modifier le mot de passe');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Changer mon mot de passe',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
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
              <Ionicons name="lock-closed-outline" size={40} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 16, color: colors.textMuted,
              textAlign: 'center', marginTop: 12, paddingHorizontal: 20,
            }}>
              Choisis un mot de passe fort d'au moins 8 caractères.
            </Text>
          </View>

          <Card>
            <PasswordField
              label="Mot de passe actuel"
              value={currentPassword}
              onChange={setCurrentPassword}
              showPassword={showPassword}
              colors={colors}
            />
            <View style={{ height: 12 }} />
            <PasswordField
              label="Nouveau mot de passe"
              value={newPassword}
              onChange={setNewPassword}
              showPassword={showPassword}
              colors={colors}
            />
            <View style={{ height: 12 }} />
            <PasswordField
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showPassword={showPassword}
              colors={colors}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={colors.textMuted}
              />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {showPassword ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
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
                Modifier le mot de passe
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function PasswordField({ label, value, onChange, showPassword, colors }: any) {
  return (
    <View>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={!showPassword}
        style={{
          backgroundColor: colors.surfaceVariant,
          borderRadius: BorderRadius.md,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.text,
          fontSize: 15,
        }}
        placeholder="••••••••"
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}
