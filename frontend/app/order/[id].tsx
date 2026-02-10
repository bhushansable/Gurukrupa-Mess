import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LanguageContext';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

const STEPS = ['pending', 'preparing', 'out_for_delivery', 'delivered'];
const STEP_ICONS = ['time', 'flame', 'bicycle', 'checkmark-circle'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLang();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) api.getOrder(id).then(setOrder).catch(console.log).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>;
  if (!order) return <View style={styles.center}><Text style={styles.errorText}>Order not found</Text></View>;

  const currentStep = STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Status Tracker */}
      <View style={styles.trackerCard}>
        <Text style={styles.trackerTitle}>Order Status</Text>
        <View style={styles.stepsContainer}>
          {STEPS.map((step, idx) => {
            const isActive = idx <= currentStep;
            const isCurrent = idx === currentStep;
            return (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepDot, isActive && styles.stepDotActive, isCurrent && styles.stepDotCurrent]}>
                    <Ionicons name={STEP_ICONS[idx] as any} size={16} color={isActive ? '#FFF' : COLORS.text.muted} />
                  </View>
                  {idx < STEPS.length - 1 && <View style={[styles.stepLine, isActive && styles.stepLineActive]} />}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{t(step)}</Text>
                  {isCurrent && <Text style={styles.stepCurrent}>Current</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Details</Text>
        {order.items?.map((item: any, idx: number) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name} x{item.qty}</Text>
            <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{order.total}</Text>
        </View>
      </View>

      {/* Delivery Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Info</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={18} color={COLORS.primary.default} />
          <Text style={styles.infoText}>{order.delivery_address || 'Not specified'}</Text>
        </View>
        {order.notes ? (
          <View style={styles.infoRow}>
            <Ionicons name="document-text" size={18} color={COLORS.primary.default} />
            <Text style={styles.infoText}>{order.notes}</Text>
          </View>
        ) : null}
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={18} color={COLORS.primary.default} />
          <Text style={styles.infoText}>{new Date(order.created_at).toLocaleString()}</Text>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background.default },
  content: { padding: SPACING.l },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.default },
  errorText: { fontSize: FONT_SIZE.body, color: COLORS.status.error },
  trackerCard: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.xl, padding: SPACING.l, marginBottom: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  trackerTitle: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.l },
  stepsContainer: {},
  stepRow: { flexDirection: 'row', minHeight: 60 },
  stepLeft: { alignItems: 'center', width: 40 },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background.subtle, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E7E5E4' },
  stepDotActive: { backgroundColor: COLORS.primary.default, borderColor: COLORS.primary.default },
  stepDotCurrent: { backgroundColor: COLORS.primary.light, borderColor: COLORS.primary.light },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E7E5E4', marginVertical: 4 },
  stepLineActive: { backgroundColor: COLORS.primary.default },
  stepInfo: { flex: 1, marginLeft: SPACING.m, paddingBottom: SPACING.m },
  stepLabel: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.muted },
  stepLabelActive: { color: COLORS.text.primary },
  stepCurrent: { fontSize: FONT_SIZE.small, color: COLORS.primary.default, fontWeight: '600', marginTop: 2 },
  card: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.l, marginBottom: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  cardTitle: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.s },
  itemName: { fontSize: FONT_SIZE.body, color: COLORS.text.primary },
  itemPrice: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  divider: { height: 1, backgroundColor: '#F5F5F4', marginVertical: SPACING.s },
  totalLabel: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  totalPrice: { fontSize: FONT_SIZE.h3, fontWeight: '800', color: COLORS.primary.default },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.s, marginBottom: SPACING.m },
  infoText: { flex: 1, fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, lineHeight: 20 },
});
