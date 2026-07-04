// ==========================================
// SCREEN - Modal
// ==========================================
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useAppContexts';
import { Spacing, FontSize } from '@/constants/Colors';

export default function ModalScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: Spacing.xl }}>
      <Text style={{ fontSize: FontSize.xl, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
        Modal
      </Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ fontSize: FontSize.md, color: colors.primary, fontWeight: '600' }}>Fermer</Text>
      </TouchableOpacity>
    </View>
  );
}
