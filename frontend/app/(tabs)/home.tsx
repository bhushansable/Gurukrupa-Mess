import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LanguageContext';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const CATEGORY_ICONS: Record<string, string> = {
  dal: 'water',
  roti: 'pizza',
  rice: 'nutrition',
  sabzi: 'leaf',
  sweet: 'ice-cream',
  salad: 'flower',
  extra: 'add-circle',
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const today = DAYS[new Date().getDay()];

  const fetchMenu = useCallback(async () => {
    try {
      const items = await api.getMenu(today);
      setMenu(items);
    } catch (e) {
      console.log('Menu fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const dailyItems = menu.filter(i => i.day_of_week === 'daily');
  const specialItems = menu.filter(i => i.day_of_week !== 'daily');

  const handleOrder = () => {
    router.push('/checkout');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMenu(); }} tintColor={COLORS.primary.default} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste, {user?.name?.split(' ')[0]} 🙏</Text>
            <Text style={styles.headerTitle}>{t('gurukrupa_mess')}</Text>
          </View>
          <TouchableOpacity testID="home-orders-btn" onPress={() => router.push('/order-history')} style={styles.historyBtn}>
            <Ionicons name="receipt-outline" size={22} color={COLORS.primary.default} />
          </TouchableOpacity>
        </View>

        {/* Hero Card - Delivery */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTag}>{t('ghar_ka_swad')}</Text>
            <Text style={styles.heroTitle}>{t('single_tiffin')}</Text>
            <Text style={styles.heroPrice}>₹80</Text>
            <Text style={styles.heroSub}>Dal + Rice + Roti + Sabzi + Salad</Text>
            <TouchableOpacity testID="order-now-btn" style={styles.heroBtn} onPress={handleOrder}>
              <Text style={styles.heroBtnText}>{t('order_now')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroEmoji}>🍱</Text>
        </View>

        {/* Dine-In Card */}
        <View style={styles.dineInCard}>
          <View style={styles.dineInLeft}>
            <View style={styles.dineInBadge}>
              <Ionicons name="infinite" size={14} color="#FFF" />
              <Text style={styles.dineInBadgeText}>{t('unlimited_food')}</Text>
            </View>
            <Text style={styles.dineInTitle}>{t('dine_in_title')}</Text>
            <Text style={styles.dineInPrice}>₹80</Text>
            <Text style={styles.dineInDesc}>{t('unlimited_desc')}</Text>
            <Text style={styles.dineInIncludes}>{t('unlimited_includes')}</Text>
            <TouchableOpacity testID="dine-in-btn" style={styles.dineInBtn} onPress={() => router.push('/checkout?mode=dine_in')}>
              <Ionicons name="restaurant" size={16} color={COLORS.secondary.dark} />
              <Text style={styles.dineInBtnText}>{t('eat_at_mess')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.dineInEmoji}>🍽️</Text>
        </View>

        {/* Today's Special */}
        {specialItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('special_today')}</Text>
            <View style={styles.grid}>
              {specialItems.map(item => (
                <View key={item.id} style={styles.menuCard}>
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={(CATEGORY_ICONS[item.category] || 'restaurant') as any} size={24} color={COLORS.primary.default} />
                  </View>
                  <Text style={styles.menuName}>{lang === 'mr' ? item.name_mr : item.name_en}</Text>
                  <Text style={styles.menuDesc} numberOfLines={2}>{lang === 'mr' ? item.description_mr : item.description_en}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Daily Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('daily_items')}</Text>
          {dailyItems.map(item => (
            <View key={item.id} style={styles.dailyItem}>
              <View style={styles.dailyIcon}>
                <Ionicons name={(CATEGORY_ICONS[item.category] || 'restaurant') as any} size={20} color={COLORS.primary.default} />
              </View>
              <View style={styles.dailyInfo}>
                <Text style={styles.dailyName}>{lang === 'mr' ? item.name_mr : item.name_en}</Text>
                <Text style={styles.dailyDesc}>{lang === 'mr' ? item.description_mr : item.description_en}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickRow}>
            <TouchableOpacity testID="quick-menu-btn" style={styles.quickCard} onPress={() => router.push('/(tabs)/menu')}>
              <Ionicons name="calendar" size={28} color={COLORS.primary.default} />
              <Text style={styles.quickLabel}>{t('weekly_menu')}</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="quick-plans-btn" style={styles.quickCard} onPress={() => router.push('/(tabs)/plans')}>
              <Ionicons name="card" size={28} color={COLORS.secondary.default} />
              <Text style={styles.quickLabel}>{t('subscription_plans')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            <TouchableOpacity testID="quick-support-btn" style={styles.quickCard} onPress={() => router.push('/support')}>
              <Ionicons name="chatbubbles" size={28} color={COLORS.status.info} />
              <Text style={styles.quickLabel}>{t('support')}</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="quick-orders-btn" style={styles.quickCard} onPress={() => router.push('/order-history')}>
              <Ionicons name="time" size={28} color={COLORS.status.warning} />
              <Text style={styles.quickLabel}>{t('my_orders')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  scroll: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.default },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.l, paddingTop: SPACING.m },
  greeting: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary },
  headerTitle: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.text.primary, marginTop: 2 },
  historyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary.bg, justifyContent: 'center', alignItems: 'center' },
  heroCard: { margin: SPACING.l, backgroundColor: COLORS.primary.default, borderRadius: RADIUS.xl, padding: SPACING.l, flexDirection: 'row', alignItems: 'center', ...SHADOWS.medium },
  heroContent: { flex: 1 },
  heroTag: { fontSize: FONT_SIZE.small, color: '#FFF', opacity: 0.8 },
  heroTitle: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: '#FFF', marginTop: SPACING.xs },
  heroPrice: { fontSize: FONT_SIZE.h1, fontWeight: '800', color: '#FFF', marginTop: SPACING.xs },
  heroSub: { fontSize: FONT_SIZE.small, color: '#FFF', opacity: 0.8, marginTop: SPACING.xs },
  heroBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: RADIUS.full, paddingVertical: 10, paddingHorizontal: SPACING.m, marginTop: SPACING.m, alignSelf: 'flex-start', gap: 6 },
  heroBtnText: { fontSize: FONT_SIZE.caption, fontWeight: '700', color: COLORS.primary.default },
  heroEmoji: { fontSize: 72, marginLeft: SPACING.s },
  section: { paddingHorizontal: SPACING.l, marginTop: SPACING.l },
  sectionTitle: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.m },
  menuCard: { width: '47%', backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  menuIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary.bg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.s },
  menuName: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  menuDesc: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 4 },
  dailyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background.paper, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.s, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  dailyIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primary.bg, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.m },
  dailyInfo: { flex: 1 },
  dailyName: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  dailyDesc: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.m },
  quickCard: { flex: 1, backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.l, alignItems: 'center', ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  quickLabel: { fontSize: FONT_SIZE.small, fontWeight: '600', color: COLORS.text.primary, marginTop: SPACING.s, textAlign: 'center' },
});
