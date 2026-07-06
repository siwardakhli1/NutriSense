// CUISINE - Top tabs : Recettes · Frigo · Scan · Courses
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

export default function CuisineLayout() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: colors.text }}>
          Cuisine
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
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            height: 3,
          },
          tabBarScrollEnabled: false,
          swipeEnabled: true,
          lazy: false,
        }}
      >
        <MaterialTopTabs.Screen name="recipes" options={{ title: 'Recettes' }} />
        <MaterialTopTabs.Screen name="fridge" options={{ title: 'Frigo' }} />
        <MaterialTopTabs.Screen name="scanner" options={{ title: 'Scan' }} />
        <MaterialTopTabs.Screen name="shopping" options={{ title: 'Courses' }} />
      </MaterialTopTabs>
    </SafeAreaView>
  );
}
