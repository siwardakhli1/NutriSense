// ==========================================
// MINI CHARTS - Graphiques simples sans dépendance externe
// ==========================================
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useAppContexts';

// ========== BAR CHART ==========
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  maxValue?: number;
  showValues?: boolean;
  style?: ViewStyle;
}

export function BarChart({ data, height = 120, maxValue, showValues = true, style }: BarChartProps) {
  const { colors } = useTheme();
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: height + 30 }, style]}>
      {data.map((item, i) => {
        const barHeight = Math.max((item.value / max) * height, 2);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            {showValues && (
              <Text style={{ fontSize: 10, color: colors.text, fontWeight: '600', marginBottom: 2 }}>
                {item.value > 0 ? Math.round(item.value) : ''}
              </Text>
            )}
            <View
              style={{
                width: '80%',
                height: barHeight,
                backgroundColor: item.color || colors.primary,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            />
            <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ========== LINE CHART (simplified with dots + lines) ==========
interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function LineChart({ data, height = 120, color, style }: LineChartProps) {
  const { colors } = useTheme();
  const lineColor = color || colors.primary;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  return (
    <View style={[{ height: height + 40 }, style]}>
      {/* Zone graphique */}
      <View style={{ flexDirection: 'row', height, alignItems: 'flex-end', position: 'relative' }}>
        {data.map((item, i) => {
          const normalizedHeight = ((item.value - min) / range) * height;
          const isFirst = i === 0;
          const isLast = i === data.length - 1;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              {/* Ligne verticale pointillée */}
              <View
                style={{
                  position: 'absolute',
                  top: height - normalizedHeight,
                  bottom: 0,
                  width: 1,
                  backgroundColor: colors.border,
                  opacity: 0.3,
                }}
              />
              {/* Point */}
              <View
                style={{
                  position: 'absolute',
                  bottom: normalizedHeight - 5,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: lineColor,
                  borderWidth: 2,
                  borderColor: colors.background,
                  zIndex: 2,
                }}
              />
              {/* Ligne vers point suivant (approximation) */}
              {!isLast && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: normalizedHeight,
                    left: '50%',
                    right: '-50%',
                    height: 2,
                    backgroundColor: lineColor,
                    opacity: 0.5,
                    zIndex: 1,
                  }}
                />
              )}
              {/* Valeur */}
              <Text
                style={{
                  position: 'absolute',
                  top: Math.max(height - normalizedHeight - 20, 0),
                  fontSize: 9,
                  color: colors.textMuted,
                  fontWeight: '600',
                }}
              >
                {Math.round(item.value)}
              </Text>
            </View>
          );
        })}
      </View>
      {/* Labels axe X */}
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        {data.map((item, i) => (
          <Text
            key={i}
            style={{ flex: 1, textAlign: 'center', fontSize: 10, color: colors.textMuted }}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ========== PIE CHART (as ring stack) ==========
interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  style?: ViewStyle;
}

export function PieChart({ data, size = 120, style }: PieChartProps) {
  const { colors } = useTheme();
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 20 }, style]}>
      {/* Cercle empilé (visualisation simplifiée) */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          flexDirection: 'row',
        }}
      >
        {data.map((item, i) => {
          const percent = (item.value / total) * 100;
          return (
            <View
              key={i}
              style={{
                width: `${percent}%`,
                height: '100%',
                backgroundColor: item.color,
              }}
            />
          );
        })}
      </View>
      {/* Légende */}
      <View style={{ flex: 1, gap: 6 }}>
        {data.map((item, i) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: item.color,
                }}
              />
              <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: '700' }}>
                {percent}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ========== PROGRESS RING ==========
interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  style?: ViewStyle;
}

export function ProgressRing({ value, size = 80, color, label, sublabel, style }: ProgressRingProps) {
  const { colors } = useTheme();
  const ringColor = color || colors.primary;
  const percent = Math.max(0, Math.min(100, value));

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 6,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Arc de progression (simplifié - anneau externe partiel) */}
        <View
          style={{
            position: 'absolute',
            top: -6,
            left: -6,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 6,
            borderColor: 'transparent',
            borderTopColor: ringColor,
            borderRightColor: percent > 25 ? ringColor : 'transparent',
            borderBottomColor: percent > 50 ? ringColor : 'transparent',
            borderLeftColor: percent > 75 ? ringColor : 'transparent',
            transform: [{ rotate: '-45deg' }],
          }}
        />
        {/* Texte central */}
        <Text style={{ fontSize: size * 0.24, fontWeight: '800', color: colors.text }}>
          {label ?? `${Math.round(percent)}%`}
        </Text>
      </View>
      {sublabel && (
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
          {sublabel}
        </Text>
      )}
    </View>
  );
}
