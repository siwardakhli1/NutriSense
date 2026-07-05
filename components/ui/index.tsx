// ==========================================
// UI COMPONENTS
// Composants réutilisables avec thème global
// ==========================================
import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/hooks/useAppContexts';
import { BorderRadius, FontSize, Spacing } from '@/constants/Colors';

// ========== BUTTON ==========
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  // Props accessibilité (WCAG 2.1 / RGAA 4.1)
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();

  const bgColor = {
    primary: colors.primary,
    secondary: colors.accent,
    outline: 'transparent',
    ghost: 'transparent',
  }[variant];

  const textColor = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: colors.primary,
    ghost: colors.primary,
  }[variant];

  const paddingV = { sm: 10, md: 16, lg: 20 }[size];
  const fontSize = { sm: 13, md: 15, lg: 17 }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      // Accessibilité RGAA 4.1 : chaque bouton doit être identifiable par un lecteur d'écran
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      testID={testID}
      style={[
        {
          backgroundColor: bgColor,
          paddingVertical: paddingV,
          paddingHorizontal: Spacing.lg,
          borderRadius: BorderRadius.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : 1,
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: colors.primary,
          // Cible tactile minimum 48x48px (WCAG 2.5.5)
          minHeight: 48,
        },
        variant === 'primary' && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={{ color: textColor, fontSize, fontWeight: '700' }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ========== CARD ==========
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outline';
  // Props accessibilité
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Card({ children, onPress, style, variant = 'elevated', accessibilityLabel, accessibilityHint, testID }: CardProps) {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...(variant === 'elevated' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 3,
    }),
    ...(variant === 'outline' && {
      borderWidth: 1,
      borderColor: colors.border,
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={testID}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

// ========== INPUT ==========
interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function InputField({ label, error, icon, style, ...props }: InputFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.textSecondary }}>
          {label}
        </Text>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.md,
            paddingHorizontal: Spacing.md,
            borderWidth: 1.5,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        {icon && <View style={{ marginRight: 10 }} accessibilityElementsHidden={true} importantForAccessibility="no">{icon}</View>}
        <TextInput
          placeholderTextColor={colors.textMuted}
          // Accessibilité RGAA 11.1 : le label est lié au champ
          accessible={true}
          accessibilityLabel={label || props.placeholder}
          accessibilityHint={error ? `Erreur : ${error}` : undefined}
          style={[
            {
              flex: 1,
              paddingVertical: 14,
              fontSize: FontSize.md,
              color: colors.text,
              minHeight: 48, // Cible tactile WCAG 2.5.5
            },
            style,
          ]}
          {...props}
        />
      </View>
      {error && (
        <Text
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={{ fontSize: FontSize.xs, color: colors.error, marginLeft: 4 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// ========== LOADING SPINNER ==========
interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  const { colors } = useTheme();

  const content = (
    <View style={{ alignItems: 'center', gap: 12, padding: Spacing.xl }}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={{ fontSize: FontSize.md, color: colors.textSecondary, textAlign: 'center' }}>
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        {content}
      </View>
    );
  }

  return content;
}

// ========== ERROR DISPLAY ==========
interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorDisplay({ message, onRetry, retryLabel = 'Réessayer' }: ErrorDisplayProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>😕</Text>
      <Text
        style={{
          fontSize: FontSize.lg,
          fontWeight: '700',
          color: colors.text,
          textAlign: 'center',
          marginBottom: Spacing.sm,
        }}
      >
        Oups !
      </Text>
      <Text
        style={{
          fontSize: FontSize.md,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: Spacing.lg,
          lineHeight: 22,
        }}
      >
        {message}
      </Text>
      {onRetry && <Button title={retryLabel} onPress={onRetry} variant="outline" size="sm" />}
    </View>
  );
}
