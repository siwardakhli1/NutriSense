// ==========================================
// SCREEN - Mon compte (nom, email, mot de passe)
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useTheme, useAuth } from '@/hooks/useAppContexts';
import { Button, Card, InputField } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

export default function AccountScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Profil
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSaveProfile = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom doit contenir au moins 2 caractères');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Erreur', 'Email invalide');
      return;
    }

    setSavingProfile(true);
    const res = await api.put('/auth/me', { name: name.trim(), email: email.trim().toLowerCase() });
    setSavingProfile(false);

    if (res.success) {
      Alert.alert('Enregistré', 'Ton profil a été mis à jour. Reconnecte-toi pour que le changement soit visible partout.');
    } else {
      Alert.alert('Erreur', res.message || 'Impossible de mettre à jour');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Erreur', 'Renseigne ton mot de passe actuel');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit faire au moins 8 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setSavingPassword(true);
    const res = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    setSavingPassword(false);

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Enregistré', 'Ton mot de passe a été modifié');
    } else {
      Alert.alert('Erreur', res.message || 'Impossible de modifier le mot de passe');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mon compte',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>

          {/* Section Profil */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                Informations personnelles
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <InputField
                label="Nom complet"
                value={name}
                onChangeText={setName}
                placeholder="Ton nom"
                autoCapitalize="words"
              />
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="ton@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <Button
                title="Enregistrer"
                onPress={handleSaveProfile}
                loading={savingProfile}
                disabled={savingProfile}
              />
            </View>
          </Card>

          {/* Section Mot de passe */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                Changer le mot de passe
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <InputField
                label="Mot de passe actuel"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <InputField
                label="Nouveau mot de passe"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Au moins 8 caractères"
                secureTextEntry
              />
              <InputField
                label="Confirme le nouveau"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Retape le nouveau"
                secureTextEntry
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <Button
                title="Modifier le mot de passe"
                onPress={handleChangePassword}
                loading={savingPassword}
                disabled={savingPassword}
                variant="outline"
              />
            </View>
          </Card>

          {/* Bouton mot de passe oublié */}
          <TouchableOpacity
            onPress={() => router.push('/forgot-password')}
            style={{
              alignItems: 'center',
              padding: Spacing.md,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}
