// ==========================================
// SCREEN - Assistant IA (v2 : historique + RAG + sources)
// ==========================================
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: string[];
  createdAt: string;
}

const SUGGESTIONS = [
  'Comment perdre du poids sainement ?',
  'Aliments riches en protéines pas chers ?',
  'Petit-déjeuner idéal pour prise de masse ?',
  'Menu végétarien équilibré pour la semaine ?',
];

export default function AssistantScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadHistory = useCallback(async () => {
    const res = await api.get<Message[]>('/ai/history?limit=30');
    if (res.success && res.data) setMessages(res.data);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const send = async (customMessage?: string) => {
    const text = (customMessage || input).trim();
    if (!text || sending) return;

    const userMsg: Message = {
      id: `tmp-${Date.now()}`, role: 'user', content: text, sources: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setSending(true);

    const res = await api.post<{ answer: string; sources: string[]; usedLLM: boolean }>('/ai/advice', { message: text });
    if (res.success && res.data) {
      const aiMsg: Message = {
        id: `tmp-${Date.now() + 1}`, role: 'assistant',
        content: res.data.answer, sources: res.data.sources,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, aiMsg]);
    } else {
      Alert.alert('Erreur', res.message || "Assistant indisponible");
    }

    setSending(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const clearHistory = () => {
    Alert.alert('Effacer historique ?', '', [
      { text: 'Annuler' },
      {
        text: 'Effacer', style: 'destructive',
        onPress: async () => {
          await api.delete('/ai/history');
          setMessages([]);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: Spacing.lg, paddingVertical: 12,
          borderBottomWidth: 1, borderColor: colors.border,
        }}>
          <View>
            <Text style={{ fontSize: FontSize.lg, fontWeight: '800', color: colors.text }}>
              Assistant IA 🧠
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Alimenté par un RAG nutritionnel
            </Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Ionicons name="trash-outline" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: Spacing.lg }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View>
              <Text style={{
                fontSize: 15, color: colors.textMuted, marginBottom: 16, textAlign: 'center',
              }}>
                👋 Pose-moi une question, ou choisis un exemple :
              </Text>
              {SUGGESTIONS.map((sugg) => (
                <TouchableOpacity
                  key={sugg}
                  onPress={() => send(sugg)}
                  style={{
                    backgroundColor: colors.surface, padding: 12,
                    borderRadius: BorderRadius.md, marginBottom: 8,
                    borderWidth: 1, borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.text }}>{sugg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', marginBottom: 12,
              }}
            >
              <View style={{
                backgroundColor: msg.role === 'user' ? colors.primary : colors.surface,
                padding: 12, borderRadius: BorderRadius.md,
                borderTopRightRadius: msg.role === 'user' ? 4 : BorderRadius.md,
                borderTopLeftRadius: msg.role === 'assistant' ? 4 : BorderRadius.md,
              }}>
                <Text style={{
                  color: msg.role === 'user' ? '#fff' : colors.text, lineHeight: 20,
                }}>
                  {msg.content}
                </Text>
              </View>
              {msg.role === 'assistant' && msg.sources.length > 0 && (
                <View style={{ marginTop: 6, paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontStyle: 'italic' }}>
                    📚 {msg.sources.join(' • ')}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {sending && (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.textMuted }}>L'assistant réfléchit...</Text>
            </View>
          )}
        </ScrollView>

        <View style={{
          flexDirection: 'row', gap: 8, padding: 12,
          borderTopWidth: 1, borderColor: colors.border,
        }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ta question..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
            style={{
              flex: 1, backgroundColor: colors.surfaceVariant,
              borderRadius: BorderRadius.md, paddingHorizontal: 14,
              paddingVertical: 10, color: colors.text, maxHeight: 100,
            }}
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={sending || !input.trim()}
            style={{
              backgroundColor: input.trim() ? colors.primary : colors.surfaceVariant,
              width: 48, height: 48, borderRadius: BorderRadius.md,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Ionicons name="send" size={20} color={input.trim() ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
