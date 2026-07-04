// ==========================================
// SCREEN - Profile Tab
// ==========================================
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme, useAuth, useLanguage } from '@/hooks/useAppContexts';
import { useLocation } from '@/hooks/useNativeAPIs';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { LOCALE_LABELS, Locale } from '@/i18n';
import { useState } from 'react';

function SettingsRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  rightElement,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconColor + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={{ flex: 1, fontSize: FontSize.md, fontWeight: '500', color: colors.text }}>
        {label}
      </Text>
      {value && (
        <Text style={{ fontSize: FontSize.sm, color: colors.textMuted, marginRight: 8 }}>{value}</Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { colors, mode, setMode, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const { address, requestLocation } = useLocation();

  const handleThemeChange = () => {
    const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };

  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleLanguageChange = () => {
    setLangModalVisible(true);
  };

  const chooseLang = (loc: Locale) => {
    setLocale(loc);
    setLangModalVisible(false);
    if (loc === 'ar') {
      // L'arabe (RTL) nécessite un redémarrage complet pour appliquer la direction
      Alert.alert(
        'العربية',
        'يرجى إعادة تشغيل التطبيق لتطبيق اتجاه اليمين إلى اليسار بالكامل.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t.auth.logout,
      'Es-tu sûr(e) de vouloir te déconnecter ?',
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.auth.logout, style: 'destructive', onPress: logout },
      ]
    );
  };

  const themeLabel =
    mode === 'light' ? t.profile.lightMode : mode === 'dark' ? t.profile.darkMode : t.profile.systemMode;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text, marginBottom: Spacing.lg }}>
          {t.profile.title}
        </Text>

        {/* User info */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            padding: Spacing.lg,
            borderRadius: BorderRadius.xl,
            backgroundColor: colors.card,
            marginBottom: Spacing.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28 }}>👤</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              {user?.name ?? 'Utilisateur'}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>
              {user?.email ?? 'email@example.com'}
            </Text>
          </View>
        </View>

        {/* Preferences (New) */}
        <TouchableOpacity
          onPress={() => router.push('/preferences')}
          activeOpacity={0.7}
          style={{
            backgroundColor: colors.card,
            borderRadius: BorderRadius.xl,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: colors.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Text style={{ fontSize: 24 }}>🎯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              Mes préférences
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Objectif, budget, régimes, portions
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Settings */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: BorderRadius.xl,
            padding: Spacing.md,
            marginBottom: Spacing.lg,
          }}
        >
          <SettingsRow
            icon="🎨"
            iconColor="#6C63FF"
            label={t.profile.theme}
            value={themeLabel}
            onPress={handleThemeChange}
          />
          <SettingsRow
            icon="🌐"
            iconColor="#4CAF50"
            label={t.profile.language}
            value={`${LOCALE_LABELS[locale].flag} ${LOCALE_LABELS[locale].native}`}
            onPress={handleLanguageChange}
          />
          <SettingsRow
            icon="🔔"
            iconColor="#FF9800"
            label={t.profile.notifications}
            rightElement={
              <Switch
                value={true}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsRow
            icon="📍"
            iconColor="#E91E63"
            label="Localisation"
            value={address ?? 'Non définie'}
            onPress={requestLocation}
          />
        </View>

        {/* Security */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: BorderRadius.xl,
            padding: Spacing.md,
            marginBottom: Spacing.lg,
          }}
        >
          <SettingsRow
            icon="🔒"
            iconColor="#F44336"
            label="Changer mon mot de passe"
            onPress={() => router.push('/change-password')}
          />
        </View>

        {/* About & Logout */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: BorderRadius.xl,
            padding: Spacing.md,
            marginBottom: Spacing.lg,
          }}
        >
          <SettingsRow
            icon="ℹ️"
            iconColor="#2196F3"
            label={t.profile.about}
            value="v1.0.0"
            onPress={() => {}}
          />
          <SettingsRow
            icon="🚪"
            iconColor="#F44336"
            label={t.auth.logout}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          onPress={() => setLangModalVisible(false)}
          style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <Pressable
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              width: '85%',
              maxWidth: 400,
            }}
          >
            <Text style={{
              fontSize: 18, fontWeight: '800', color: colors.text,
              textAlign: 'center', marginBottom: 16,
            }}>
              🌍 {t.profile.language}
            </Text>
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => {
              const isSelected = locale === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  onPress={() => chooseLang(loc)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: 14, borderRadius: 12, marginBottom: 6,
                    backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>
                    {LOCALE_LABELS[loc].flag}
                  </Text>
                  <Text style={{
                    flex: 1, fontSize: 16, fontWeight: '600',
                    color: isSelected ? colors.primary : colors.text,
                  }}>
                    {LOCALE_LABELS[loc].native}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => setLangModalVisible(false)}
              style={{ padding: 12, marginTop: 8 }}
            >
              <Text style={{ color: colors.textMuted, textAlign: 'center', fontWeight: '600' }}>
                {t.common.cancel}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
