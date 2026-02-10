import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const renderCustomer = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={14} color={COLORS.text.muted} />
          <Text style={styles.detail}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={14} color={COLORS.text.muted} />
          <Text style={styles.detail}>{item.phone}</Text>
        </View>
        {item.address ? (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.text.muted} />
            <Text style={styles.detail} numberOfLines={1}>{item.address}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>;

  return (
    <View style={styles.safe}>
      <FlatList
        data={customers}
        keyExtractor={item => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCustomers(); }} tintColor={COLORS.primary.default} />}
        ListHeaderComponent={
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{customers.length} customers</Text>
          </View>
        }
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No customers yet</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.default },
  list: { padding: SPACING.m },
  countBadge: { backgroundColor: COLORS.primary.bg, paddingVertical: SPACING.s, paddingHorizontal: SPACING.m, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.m },
  countText: { fontSize: FONT_SIZE.caption, fontWeight: '700', color: COLORS.primary.default },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.m, marginBottom: SPACING.s, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary.default, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.m },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  detail: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.body, color: COLORS.text.muted },
});
