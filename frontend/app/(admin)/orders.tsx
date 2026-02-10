import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LanguageContext';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

const STATUSES = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = { pending: COLORS.status.warning, preparing: COLORS.status.info, out_for_delivery: COLORS.primary.default, delivered: COLORS.status.success, cancelled: COLORS.status.error };

export default function AdminOrders() {
  const { t } = useLang();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getAllOrders(filter || undefined);
      setOrders(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchOrders(); }, [fetchOrders]);

  const updateStatus = (orderId: string, currentStatus: string) => {
    const currentIdx = STATUSES.indexOf(currentStatus);
    const nextStatuses = STATUSES.filter((_, i) => i > currentIdx && i < STATUSES.length);
    if (nextStatuses.length === 0) return;

    Alert.alert('Update Status', 'Select new status', [
      ...nextStatuses.map(s => ({
        text: t(s),
        onPress: async () => {
          try {
            await api.updateOrderStatus(orderId, s);
            fetchOrders();
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      })),
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  const renderOrder = ({ item }: { item: any }) => {
    const color = STATUS_COLORS[item.status] || COLORS.text.muted;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: color + '15' }]}>
            <Text style={[styles.badgeText, { color }]}>{t(item.status)}</Text>
          </View>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.customerName}>{item.user_name}</Text>
        <Text style={styles.customerPhone}>{item.user_phone}</Text>
        <Text style={styles.items}>{item.items?.map((i: any) => `${i.name} x${i.qty}`).join(', ')}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.total}>₹{item.total}</Text>
          {item.status !== 'delivered' && item.status !== 'cancelled' && (
            <TouchableOpacity testID={`update-order-${item.id}-btn`} style={styles.updateBtn} onPress={() => updateStatus(item.id, item.status)}>
              <Text style={styles.updateBtnText}>Update Status</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary.default} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.safe}>
      <ScrollableFilter filter={filter} setFilter={setFilter} t={t} />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={COLORS.primary.default} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No orders</Text></View>}
        />
      )}
    </View>
  );
}

function ScrollableFilter({ filter, setFilter, t }: { filter: string | null; setFilter: (f: string | null) => void; t: (k: string) => string }) {
  return (
    <View style={styles.filterRow}>
      <TouchableOpacity testID="filter-all-btn" style={[styles.filterChip, !filter && styles.filterChipActive]} onPress={() => setFilter(null)}>
        <Text style={[styles.filterText, !filter && styles.filterTextActive]}>All</Text>
      </TouchableOpacity>
      {STATUSES.slice(0, -1).map(s => (
        <TouchableOpacity key={s} testID={`filter-${s}-btn`} style={[styles.filterChip, filter === s && styles.filterChipActive]} onPress={() => setFilter(s)}>
          <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{t(s)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, gap: SPACING.xs, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.background.paper, borderWidth: 1, borderColor: '#E7E5E4' },
  filterChipActive: { backgroundColor: COLORS.primary.default, borderColor: COLORS.primary.default },
  filterText: { fontSize: FONT_SIZE.small, fontWeight: '600', color: COLORS.text.secondary },
  filterTextActive: { color: '#FFF' },
  list: { padding: SPACING.m },
  card: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.s },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: FONT_SIZE.small, fontWeight: '700' },
  date: { fontSize: FONT_SIZE.small, color: COLORS.text.muted },
  customerName: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  customerPhone: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary },
  items: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, marginTop: SPACING.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.m, paddingTop: SPACING.s, borderTopWidth: 1, borderTopColor: '#F5F5F4' },
  total: { fontSize: FONT_SIZE.h3, fontWeight: '800', color: COLORS.primary.default },
  updateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: RADIUS.full, backgroundColor: COLORS.primary.bg },
  updateBtnText: { fontSize: FONT_SIZE.small, fontWeight: '600', color: COLORS.primary.default },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.body, color: COLORS.text.muted },
});
