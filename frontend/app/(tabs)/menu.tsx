import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LanguageContext';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAYS_NOW = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const CATEGORY_ICONS: Record<string, string> = {
  dal: 'water', roti: 'pizza', rice: 'nutrition', sabzi: 'leaf', sweet: 'ice-cream', salad: 'flower', extra: 'add-circle',
};

export default function MenuScreen() {
  const { t, lang } = useLang();
  const [weekly, setWeekly] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(DAYS_NOW[new Date().getDay()]);

  useEffect(() => {
    api.getWeeklyMenu().then(setWeekly).catch(console.log).finally(() => setLoading(false));
  }, []);

  const dayItems = weekly[selectedDay] || [];

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t('weekly_menu')}</Text>
      </View>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={styles.dayContainer}>
        {DAY_KEYS.map(day => {
          const isActive = day === selectedDay;
          return (
            <TouchableOpacity
              key={day}
              testID={`day-${day}-btn`}
              style={[styles.dayChip, isActive && styles.dayChipActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{t(day)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {dayItems.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.text.muted} />
            <Text style={styles.emptyText}>No menu items for this day</Text>
          </View>
        ) : (
          dayItems.map((item: any) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemIcon}>
                <Ionicons name={(CATEGORY_ICONS[item.category] || 'restaurant') as any} size={22} color={COLORS.primary.default} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{lang === 'mr' ? item.name_mr : item.name_en}</Text>
                <Text style={styles.itemDesc}>{lang === 'mr' ? item.description_mr : item.description_en}</Text>
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.category}</Text>
                  </View>
                  {item.day_of_week === 'daily' && (
                    <View style={[styles.tag, { backgroundColor: COLORS.secondary.bg }]}>
                      <Text style={[styles.tagText, { color: COLORS.secondary.default }]}>Daily</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.default },
  headerBar: { paddingHorizontal: SPACING.l, paddingTop: SPACING.m, paddingBottom: SPACING.s },
  headerTitle: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.text.primary },
  dayScroll: { maxHeight: 52, marginBottom: SPACING.s },
  dayContainer: { paddingHorizontal: SPACING.l, gap: SPACING.s },
  dayChip: { paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, borderRadius: RADIUS.full, backgroundColor: COLORS.background.paper, borderWidth: 1, borderColor: '#E7E5E4' },
  dayChipActive: { backgroundColor: COLORS.primary.default, borderColor: COLORS.primary.default },
  dayText: { fontSize: FONT_SIZE.caption, fontWeight: '600', color: COLORS.text.secondary },
  dayTextActive: { color: '#FFF' },
  list: { flex: 1 },
  listContent: { padding: SPACING.l },
  itemCard: { flexDirection: 'row', backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  itemIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary.bg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.m },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  itemDesc: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.s },
  tag: { backgroundColor: COLORS.primary.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  tagText: { fontSize: 10, fontWeight: '600', color: COLORS.primary.default, textTransform: 'uppercase' },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.body, color: COLORS.text.muted, marginTop: SPACING.m },
});
