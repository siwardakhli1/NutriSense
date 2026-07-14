// ==========================================
// MONTH CALENDAR — calendrier mensuel modal
// S'ouvre au clic sur "Juillet 2026". Permet de voir tout le mois,
// naviguer entre les mois, et sélectionner un jour de la semaine planifiée.
// ==========================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useAppContexts';

interface MonthCalendarProps {
  visible: boolean;
  onClose: () => void;
  // Dates du plan (format 'YYYY-MM-DD') pour surligner la semaine
  planDates: string[];
  // Date d'aujourd'hui 'YYYY-MM-DD'
  todayStr: string;
  // Callback quand on sélectionne un jour du plan (renvoie l'index dans planDates)
  onSelectPlanDay: (indexInPlan: number) => void;
}

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const WEEKDAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function MonthCalendar({
  visible,
  onClose,
  planDates,
  todayStr,
  onSelectPlanDay,
}: MonthCalendarProps) {
  const { colors } = useTheme();

  // Mois affiché (par défaut celui d'aujourd'hui).
  // On parse todayStr manuellement pour éviter tout décalage UTC de new Date(string).
  const [ty, tmonth] = (() => {
    if (todayStr && todayStr.length >= 7) {
      const p = todayStr.split('-');
      return [Number(p[0]), Number(p[1]) - 1];
    }
    const n = new Date();
    return [n.getFullYear(), n.getMonth()];
  })();
  const [viewYear, setViewYear] = useState(ty);
  const [viewMonth, setViewMonth] = useState(tmonth); // 0-11

  // Construire la grille du mois
  const firstDay = new Date(viewYear, viewMonth, 1);
  // getDay(): 0=dim..6=sam. On veut Lundi=0 → décalage
  const jsFirstWeekday = firstDay.getDay();
  const offset = (jsFirstWeekday + 6) % 7; // Lundi = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Cases de la grille (null pour les cases vides avant le 1er)
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${dd}`;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayPress = (day: number) => {
    const dateStr = toStr(day);
    const idx = planDates.indexOf(dateStr);
    if (idx >= 0) {
      onSelectPlanDay(idx);
      onClose();
    }
    // Si le jour n'est pas dans le plan, on ne fait rien (juste consultation)
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20 }}>
            {/* En-tête : navigation mois */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <TouchableOpacity onPress={prevMonth} style={{ padding: 6 }} accessibilityLabel="Mois précédent">
                <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                {MONTHS_FR[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={{ padding: 6 }} accessibilityLabel="Mois suivant">
                <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Jours de la semaine */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {WEEKDAYS_FR.map((wd, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>{wd}</Text>
                </View>
              ))}
            </View>

            {/* Grille des jours */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cells.map((day, i) => {
                if (day === null) {
                  return <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
                }
                const dateStr = toStr(day);
                const isToday = dateStr === todayStr;
                const isInPlan = planDates.includes(dateStr);
                const isPast = dateStr < todayStr;

                // Couleur de fond selon l'état
                let bg = 'transparent';
                let textColor = colors.text;
                let fontWeight: any = '400';
                if (isToday) {
                  bg = colors.primary;
                  textColor = '#fff';
                  fontWeight = '700';
                } else if (isInPlan) {
                  bg = colors.primaryLight;
                  textColor = colors.primary;
                  fontWeight = '600';
                } else if (isPast) {
                  textColor = colors.textMuted;
                }

                return (
                  <TouchableOpacity
                    key={dateStr}
                    onPress={() => handleDayPress(day)}
                    disabled={!isInPlan}
                    activeOpacity={isInPlan ? 0.6 : 1}
                    style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}
                  >
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        backgroundColor: bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isPast && !isInPlan ? 0.45 : 1,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: textColor, fontWeight }}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Légende */}
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.border, flexWrap: 'wrap' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.primary }} />
                <Text style={{ fontSize: 10, color: colors.textMuted }}>Aujourd'hui</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.primaryLight }} />
                <Text style={{ fontSize: 10, color: colors.textMuted }}>Ta semaine</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.border }} />
                <Text style={{ fontSize: 10, color: colors.textMuted }}>Passé</Text>
              </View>
            </View>

            {/* Bouton fermer */}
            <TouchableOpacity
              onPress={onClose}
              style={{ marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
