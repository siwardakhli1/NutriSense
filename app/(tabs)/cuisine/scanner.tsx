// ==========================================
// SCREEN - Scanner (Cuisine > Scan)
// Fonctionne sur émulateur (saisie manuelle) et téléphone réel (caméra)
// ==========================================
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '@/hooks/useAppContexts';
import { Card } from '@/components/ui';
import { Spacing, FontSize, BorderRadius } from '@/constants/Colors';
import { api } from '@/services/api';

interface Product {
  barcode: string;
  name: string;
  brand: string;
  nutriScore: string;
  novaScore: number;
  ecoScore: string;
  ingredients: string[];
  allergens: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    salt?: number;
    sugars?: number;
  };
  imageUrl?: string;
  aiAdvice: string;
  source: string;
}

// Codes-barres de démonstration (produits réellement dans Open Food Facts)
const DEMO_BARCODES = [
  { code: '3017620422003', name: 'Nutella' },
  { code: '5449000000996', name: 'Coca-Cola' },
  { code: '3229820129488', name: 'Chocapic' },
  { code: '8000500310427', name: 'Kinder Bueno' },
];

interface AlternativeProduct {
  barcode: string;
  name: string;
  brand: string;
  nutriScore: string;
  imageUrl?: string;
  improvementReason: string;
}

export default function ScannerScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [loadingAlt, setLoadingAlt] = useState(false);

  const fetchProduct = async (barcode: string) => {
    if (loading) return;
    const clean = barcode.replace(/\D/g, '');
    if (!clean || clean.length < 6) {
      Alert.alert('Erreur', 'Code-barres invalide');
      return;
    }
    setLoading(true);
    setScanning(false);
    setAlternatives([]);
    const res = await api.get<Product>(`/nutrition/product/${clean}`);
    setLoading(false);
    if (res.success && res.data) {
      setProduct(res.data);
      // Auto-log dans le journal nutritionnel
      if (res.data.nutrition.calories > 0) {
        api.post('/logs/nutrition', {
          source: 'barcode',
          label: res.data.name,
          calories: res.data.nutrition.calories,
          protein: res.data.nutrition.protein,
          carbs: res.data.nutrition.carbs,
          fat: res.data.nutrition.fat,
          fiber: res.data.nutrition.fiber,
        });
      }
      // Chercher des alternatives si le produit a un mauvais Nutri-Score
      if (['C', 'D', 'E'].includes(res.data.nutriScore)) {
        setLoadingAlt(true);
        const altRes = await api.get<{ alternatives: AlternativeProduct[] }>(
          `/nutrition/product/${clean}/alternatives`
        );
        setLoadingAlt(false);
        if (altRes.success && altRes.data) {
          setAlternatives(altRes.data.alternatives || []);
        }
      }
    } else {
      Alert.alert('Erreur', res.message || 'Produit introuvable');
    }
  };

  const nutriColor = (score: string): string => {
    const map: Record<string, string> = {
      A: '#00875a', B: '#85bb2f', C: '#f7c400', D: '#ee8100', E: '#e63e11',
    };
    return map[score] || '#999';
  };

  if (scanning) {
    if (!permission?.granted) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="camera-outline" size={60} color={colors.textMuted} />
          <Text style={{ color: colors.text, marginTop: 12, textAlign: 'center' }}>
            Autorise l'accès à la caméra
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{ marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.md }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Autoriser</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScanning(false)} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.textMuted }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={({ data }) => fetchProduct(data)}
        />
        <View style={{
          position: 'absolute', top: '40%', left: '10%', right: '10%',
          height: 120, borderWidth: 3, borderColor: '#fff', borderRadius: 16,
        }} />
        <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setScanning(false)}
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: Spacing.lg, backgroundColor: colors.background, flexGrow: 1 }}>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        Scanne un code-barres pour analyser un produit via Open Food Facts.
      </Text>

      <TouchableOpacity
        onPress={() => { setProduct(null); setScanning(true); }}
        style={{
          backgroundColor: colors.primary, padding: 18, borderRadius: BorderRadius.lg,
          alignItems: 'center', marginBottom: 14, flexDirection: 'row',
          justifyContent: 'center', gap: 10,
        }}
      >
        <Ionicons name="barcode" size={26} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Scanner avec la caméra</Text>
      </TouchableOpacity>

      {/* Saisie manuelle */}
      <Card style={{ marginBottom: 14 }}>
        <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 8 }}>
          Saisir le code manuellement
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={manualBarcode}
            onChangeText={setManualBarcode}
            placeholder="Ex: 3017620422003"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={{
              flex: 1, backgroundColor: colors.surfaceVariant, borderRadius: BorderRadius.md,
              paddingHorizontal: 14, paddingVertical: 10, color: colors.text,
            }}
          />
          <TouchableOpacity
            onPress={() => manualBarcode && fetchProduct(manualBarcode)}
            disabled={!manualBarcode}
            style={{
              backgroundColor: manualBarcode ? colors.primary : colors.surfaceVariant,
              paddingHorizontal: 18, borderRadius: BorderRadius.md, justifyContent: 'center',
            }}
          >
            <Ionicons name="search" size={20} color={manualBarcode ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Codes de démo (utile pour démo jury / test sans caméra) */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 8 }}>
          Essayer avec un produit réel
        </Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
          Tape sur un produit pour tester l'API Open Food Facts.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DEMO_BARCODES.map((demo) => (
            <TouchableOpacity
              key={demo.code}
              onPress={() => fetchProduct(demo.code)}
              style={{
                backgroundColor: colors.surfaceVariant,
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>{demo.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {loading && (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textMuted, marginTop: 8 }}>Analyse Open Food Facts...</Text>
        </View>
      )}

      {product && (
        <Card>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
                {product.name}
              </Text>
              <Text style={{ color: colors.textMuted }}>{product.brand}</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                Source : {product.source === 'off' ? 'Open Food Facts' : product.source === 'cache' ? 'Cache local' : 'Non référencé'}
              </Text>
            </View>
            <View style={{
              backgroundColor: nutriColor(product.nutriScore),
              width: 42, height: 42, borderRadius: 21,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>
                {product.nutriScore === 'unknown' ? '?' : product.nutriScore}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <View style={{ backgroundColor: colors.surfaceVariant, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600' }}>
                NOVA {product.novaScore || '?'}
              </Text>
            </View>
            <View style={{ backgroundColor: colors.surfaceVariant, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600' }}>
                Éco {product.ecoScore}
              </Text>
            </View>
          </View>

          <View style={{ backgroundColor: colors.surfaceVariant, padding: 12, borderRadius: BorderRadius.md, marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 8 }}>Pour 100g</Text>
            <NutriRow label="Calories" value={`${product.nutrition.calories} kcal`} colors={colors} />
            <NutriRow label="Protéines" value={`${product.nutrition.protein}g`} colors={colors} />
            <NutriRow label="Glucides" value={`${product.nutrition.carbs}g`} colors={colors} />
            {product.nutrition.sugars != null && (
              <NutriRow label="  dont sucres" value={`${product.nutrition.sugars}g`} colors={colors} muted />
            )}
            <NutriRow label="Lipides" value={`${product.nutrition.fat}g`} colors={colors} />
            <NutriRow label="Fibres" value={`${product.nutrition.fiber}g`} colors={colors} />
            {product.nutrition.salt != null && (
              <NutriRow label="Sel" value={`${product.nutrition.salt}g`} colors={colors} />
            )}
          </View>

          <View style={{
            backgroundColor: colors.primaryLight, padding: 12, borderRadius: BorderRadius.md,
            borderLeftWidth: 4, borderLeftColor: colors.primary,
          }}>
            <Text style={{ fontWeight: '700', color: colors.primary, marginBottom: 6 }}>
              🧠 Analyse IA
            </Text>
            <Text style={{ color: colors.text, lineHeight: 20 }}>{product.aiAdvice}</Text>
          </View>

          {product.allergens.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: colors.warning }}>
                ⚠️ Allergènes : {product.allergens.join(', ')}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Section Alternatives plus saines */}
      {product && ['C', 'D', 'E'].includes(product.nutriScore) && (
        <Card style={{ marginTop: 14, backgroundColor: '#e8f5e9' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Ionicons name="leaf-outline" size={20} color="#1b5e20" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1b5e20', flex: 1 }}>
              Alternatives plus saines
            </Text>
          </View>

          {loadingAlt ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator color="#1b5e20" />
              <Text style={{ fontSize: 12, color: '#1b5e20', marginTop: 8 }}>
                Recherche d'alternatives via Open Food Facts...
              </Text>
            </View>
          ) : alternatives.length === 0 ? (
            <Text style={{ fontSize: 12, color: '#2e7d32', textAlign: 'center', padding: 10 }}>
              Aucune alternative trouvée pour cette catégorie de produit.
            </Text>
          ) : (
            <>
              <Text style={{ fontSize: 12, color: '#2e7d32', marginBottom: 12 }}>
                Ces produits de la même catégorie ont un meilleur Nutri-Score :
              </Text>
              {alternatives.map((alt) => (
                <TouchableOpacity
                  key={alt.barcode}
                  onPress={() => fetchProduct(alt.barcode)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: '#fff', padding: 10, marginBottom: 8,
                    borderRadius: 10,
                  }}
                >
                  <View style={{
                    backgroundColor: nutriColor(alt.nutriScore),
                    width: 36, height: 36, borderRadius: 18,
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                      {alt.nutriScore}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 13, color: '#1b1b1b' }} numberOfLines={1}>
                      {alt.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#666' }} numberOfLines={1}>
                      {alt.brand}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#2e7d32', fontWeight: '600', marginTop: 2 }}>
                      ✓ {alt.improvementReason}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#4caf50" />
                </TouchableOpacity>
              ))}
            </>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

function NutriRow({ label, value, colors, muted }: any) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={{ color: muted ? colors.textMuted : colors.text, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: muted ? colors.textMuted : colors.text, fontWeight: '600', fontSize: 13 }}>{value}</Text>
    </View>
  );
}
