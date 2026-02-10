import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../src/contexts/LanguageContext';
import { api } from '../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../src/constants/theme';

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  pending: { color: COLORS.status.warning, icon: 'time' },
  preparing: { color: COLORS.status.info, icon: 'flame' },
  out_for_delivery: { color: COLORS.primary.default, icon: 'bicycle' },
  delivered: { color: COLORS.status.success, icon: 'checkmark-circle' },
  cancelled: { color: COLORS.status.error, icon: 'close-circle' },
};

export default function OrderHistoryScreen() {
  const { t } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (e) {
      console.log('Orders fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const renderOrder = ({ item }: { item: any }) => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <TouchableOpacity
        testID={`order-${item.id}-card`}
        style={styles.orderCard}
        onPress={() => router.push(`/order/${item.id}`)}
      >
        <View style={styles.orderHeader}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '15' }]}>
            <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{t(item.status)}</Text>
          </View>
          <Text style={styles.orderDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.orderBody}>
          <Text style={styles.orderItems}>{item.items?.map((i: any) => `${i.name} x${i.qty}`).join(', ')}</Text>
          <Text style={styles.orderTotal}>₹{item.total}</Text>
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.orderType}>{item.order_type === 'subscription' ? 'Subscription' : 'Single Order'}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>;

  return (
    <View style={styles.safe}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={COLORS.primary.default} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.text.muted} />
            <Text style={styles.emptyText}>{t('no_orders')}</Text>
            <TouchableOpacity testID="order-now-from-empty-btn" style={styles.emptyBtn} onPress={() => router.push('/checkout')}>
              <Text style={styles.emptyBtnText}>{t('order_now')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.default },
  list: { padding: SPACING.l },
  orderCard: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.s },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZE.small, fontWeight: '700' },
  orderDate: { fontSize: FONT_SIZE.small, color: COLORS.text.muted },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.s },
  orderItems: { flex: 1, fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  orderTotal: { fontSize: FONT_SIZE.h3, fontWeight: '800', color: COLORS.primary.default, marginLeft: SPACING.m },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.s, borderTopWidth: 1, borderTopColor: '#F5F5F4' },
  orderType: { fontSize: FONT_SIZE.small, color: COLORS.text.muted },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.body, color: COLORS.text.muted, marginTop: SPACING.m },
  emptyBtn: { backgroundColor: COLORS.primary.default, borderRadius: RADIUS.full, paddingVertical: 12, paddingHorizontal: SPACING.l, marginTop: SPACING.m },
  emptyBtnText: { color: '#FFF', fontSize: FONT_SIZE.caption, fontWeight: '700' },
});
