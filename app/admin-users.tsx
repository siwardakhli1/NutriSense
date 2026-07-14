// ==========================================
// SCREEN - Admin : Liste des utilisateurs
// Liste tous les inscrits, recherche, parrainages, badges (admin/premium).
// ==========================================
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { api } from '@/services/api';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  invitedCount: number;
  invitedByName: string | null;
  createdAt: string;
}

const PREMIUM_THRESHOLD = 5;

// Palette d'avatars (couleur dérivée du nom pour la variété)
const AVATAR_COLORS = ['#1A6B4A', '#6C63FF', '#FF6B00', '#2196F3', '#E91E63', '#FF9800'];
function avatarColor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

export default function AdminUsersScreen() {
  const { colors } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const res = await api.get<{ users: AdminUser[] }>('/admin/users');
      if (res.success && res.data) {
        setUsers(res.data.users);
      }
      setLoading(false);
    })();
  }, []);

  // Filtrer par nom ou email
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Utilisateurs',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
        <View style={{ padding: Spacing.lg, paddingBottom: 0 }}>
          {/* Recherche */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: BorderRadius.md,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: Spacing.md,
            }}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher (nom ou email)..."
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingLeft: 10,
                fontSize: FontSize.md,
                color: colors.text,
              }}
            />
          </View>

          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
            {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}
          </Text>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingTop: 0 }}>
            {filtered.map((u) => {
              const isAdmin = u.role === 'admin';
              const hasPremium = u.invitedCount >= PREMIUM_THRESHOLD;
              const initial = (u.name || '?').charAt(0).toUpperCase();
              const color = isAdmin ? colors.primary : avatarColor(u.name);

              return (
                <View
                  key={u.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 8,
                  }}
                >
                  {/* Avatar initiale */}
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: color + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '700', color }}>{initial}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    {/* Nom + badge admin */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                        {u.name}
                      </Text>
                      {isAdmin && (
                        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 }}>
                          <Text style={{ fontSize: 8, color: '#fff', fontWeight: '700' }}>ADMIN</Text>
                        </View>
                      )}
                    </View>

                    {/* Email */}
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {u.email}
                    </Text>

                    {/* Ligne parrainages */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                      <Text style={{ fontSize: 10, color: u.invitedCount > 0 ? colors.primary : colors.textMuted }}>
                        🎁 {u.invitedCount > 0 ? `${u.invitedCount} filleul${u.invitedCount > 1 ? 's' : ''}` : 'Aucun filleul'}
                      </Text>
                      {hasPremium && (
                        <Text style={{ fontSize: 10, color: colors.primary }}>⭐ Premium</Text>
                      )}
                      {u.invitedByName && (
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>
                          ↳ parrainé par {u.invitedByName}
                        </Text>
                      )}
                      {!u.invitedByName && u.invitedCount === 0 && (
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>
                          inscrit le {formatDate(u.createdAt)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {filtered.length === 0 && (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <Ionicons name="people-outline" size={40} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, marginTop: 10 }}>Aucun utilisateur trouvé</Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
