// ==========================================
// SCREEN - Mot de passe oublié (demande d'email)
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

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Erreur', 'Email invalide');
      return;
    }

    setLoading(true);
    const res = await api.post('/auth/forgot-password', { email });
    setLoading(false);

    if (res.success) {
      Alert.alert(
        '📧 Email envoyé',
        'Si un compte existe pour cet email, tu vas recevoir un code à 6 chiffres. Vérifie ta boîte de réception (et le dossier spam).',
        [{
          text: "J'ai reçu le code",
          onPress: () => router.push({
            pathname: '/(auth)/reset-password',
            params: { email },
          }),
        }]
      );
    } else {
      Alert.alert('Erreur', res.message || 'Une erreur est survenue');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mot de passe oublié',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
          <View style={{ alignItems: 'center', marginVertical: 30 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: colors.primaryLight,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
            <Text style={{
              fontSize: 22, fontWeight: '800', color: colors.text,
              marginTop: 16, textAlign: 'center',
            }}>
              Mot de passe oublié ?
            </Text>
            <Text style={{
              fontSize: 14, color: colors.textMuted,
              textAlign: 'center', marginTop: 8, paddingHorizontal: 20,
            }}>
              Entre ton email, on t'envoie un code à 6 chiffres pour créer un nouveau mot de passe.
            </Text>
          </View>

          <Card>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: BorderRadius.md,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.text,
                fontSize: 15,
              }}
            />
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
                Envoyer le code
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              ← Retour à la connexion
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
