// SUIVI - Top tabs : Stats · Santé
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@/hooks/useAppContexts';
import { FontSize, Spacing } from '@/constants/Colors';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SuiviLayout() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
          Suivi
        </Text>
      </View>

      <MaterialTopTabs
        initialLayout={{ width: SCREEN_WIDTH }}
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
          tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
          swipeEnabled: true,
          lazy: false,
        }}
      >
        <MaterialTopTabs.Screen name="stats" options={{ title: 'Stats' }} />
        <MaterialTopTabs.Screen name="health" options={{ title: 'Santé' }} />
      </MaterialTopTabs>
    </SafeAreaView>
  );
}
