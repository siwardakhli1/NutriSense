// ==========================================
// SCREEN - Register
// ==========================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useAuth, useLanguage } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { Button, InputField } from '@/components/ui';
import { Spacing, FontSize } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();
  const { vibrate, vibrateError } = useVibration();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      vibrateError();
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      vibrateError();
      return;
    }

    const result = await register(name, email, password);
    if (result.success) {
      vibrate();
    } else {
      setError(result.error || t.auth.registerError);
      vibrateError();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: Spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>👋</Text>
          <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
            Créer un compte
          </Text>
          <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, marginTop: 4 }}>
            Rejoins NutriSense gratuitement
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          <InputField
            label={t.auth.name}
            value={name}
            onChangeText={setName}
            placeholder="Jean Dupont"
            autoCapitalize="words"
            autoComplete="name"
            icon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
          />

          <InputField
            label={t.auth.email}
            value={email}
            onChangeText={setEmail}
            placeholder="ton@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
          />

          <InputField
            label={t.auth.password}
            value={password}
            onChangeText={setPassword}
            placeholder="6 caractères minimum"
            secureTextEntry
            autoComplete="new-password"
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
          />

          {error ? (
            <Text style={{ color: colors.error, fontSize: FontSize.sm, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}

          <Button
            title={t.auth.register}
            onPress={handleRegister}
            loading={isLoading}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ fontSize: FontSize.md, color: colors.textSecondary }}>
              {t.auth.hasAccount}{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{t.auth.login}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
