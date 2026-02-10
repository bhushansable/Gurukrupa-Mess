import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LanguageContext';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

export default function AdminDashboard() {
  const { t } = useLang();
  const { logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (e) {
      console.log('Dashboard error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>;

  const cards = [
    { label: t('total_orders'), value: stats?.total_orders || 0, icon: 'receipt', color: COLORS.primary.default },
    { label: t('today_orders'), value: stats?.today_orders || 0, icon: 'today', color: COLORS.status.info },
    { label: 'Pending', value: stats?.pending_orders || 0, icon: 'time', color: COLORS.status.warning },
    { label: 'Preparing', value: stats?.preparing_orders || 0, icon: 'flame', color: COLORS.primary.light },
    { label: t('total_revenue'), value: `₹${stats?.total_revenue || 0}`, icon: 'cash', color: COLORS.status.success },
    { label: t('customers'), value: stats?.total_customers || 0, icon: 'people', color: COLORS.secondary.default },
    { label: 'Subscriptions', value: stats?.active_subscriptions || 0, icon: 'card', color: COLORS.status.info },
    { label: 'Delivered', value: stats?.delivered_orders || 0, icon: 'checkmark-circle', color: COLORS.status.success },
  ];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={COLORS.primary.default} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('dashboard')}</Text>
        <TouchableOpacity testID="admin-switch-to-user-btn" style={styles.switchBtn} onPress={() => router.replace('/(tabs)/home')}>
          <Ionicons name="swap-horizontal" size={18} color={COLORS.primary.default} />
          <Text style={styles.switchText}>User View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {cards.map((card, idx) => (
          <View key={idx} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: card.color + '15' }]}>
              <Ionicons name={card.icon as any} size={22} color={card.color} />
            </View>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity testID="admin-logout-btn" style={styles.logoutBtn} onPress={() => { logout(); router.replace('/'); }}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.status.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background.default },
  content: { padding: SPACING.l },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.default },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
  headerTitle: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.text.primary },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.full, backgroundColor: COLORS.primary.bg },
  switchText: { fontSize: FONT_SIZE.small, fontWeight: '600', color: COLORS.primary.default },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.m },
  statCard: { width: '47%', backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  statIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.s },
  statValue: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.text.primary },
  statLabel: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.s, paddingVertical: 14, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.status.error + '40', marginTop: SPACING.l },
  logoutText: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.status.error },
});
