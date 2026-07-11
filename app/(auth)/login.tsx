// ==========================================
// SCREEN - Login
// ==========================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useAuth, useLanguage } from '@/hooks/useAppContexts';
import { useVibration } from '@/hooks/useNativeAPIs';
import { Button, InputField } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const { vibrate, vibrateError } = useVibration();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    setError('Veuillez remplir tous les champs');
    vibrateError();
    return;
  }

  setError('');
  const result = await login(email, password);
  console.log('>>> RESULT LOGIN:', JSON.stringify(result));  // DEBUG
  if (result.success) {
    vibrate();
  } else {
    setError(result.error || 'Email ou mot de passe incorrect');
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
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="leaf" size={48} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: FontSize.xxl, fontWeight: '800', color: colors.text }}>
            Nutri<Text style={{ color: colors.primary }}>Sense</Text>
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
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
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="password"
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
          />

          {error ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                padding: 12,
                borderRadius: 12,
                backgroundColor: '#FEE2E2',
                borderWidth: 1,
                borderColor: '#FCA5A5',
              }}
            >
              <Ionicons name="alert-circle" size={20} color="#B91C1C" />
              <Text style={{ flex: 1, color: '#B91C1C', fontSize: FontSize.sm, fontWeight: '600' }}>
                {error}
              </Text>
            </View>
          ) : null}

          <Button
            title={t.auth.login}
            onPress={handleLogin}
            loading={isLoading}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignItems: 'center', paddingTop: 12 }}
          >
            <Text style={{ fontSize: FontSize.sm, color: colors.primary, fontWeight: '600' }}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={{ fontSize: FontSize.md, color: colors.textSecondary }}>
              {t.auth.noAccount}{' '}
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{t.auth.register}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
