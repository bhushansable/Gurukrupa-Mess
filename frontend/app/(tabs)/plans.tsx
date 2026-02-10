import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LanguageContext';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

export default function PlansScreen() {
  const { t, lang } = useLang();
  const [plans, setPlans] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getPlans(), api.getSubscriptions()])
      .then(([p, s]) => { setPlans(p); setSubs(s); })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    Alert.alert(t('confirm'), 'Subscribe to this plan? (Mock payment)', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('subscribe'),
        onPress: async () => {
          setSubscribing(planId);
          try {
            const plan = plans.find(p => p.id === planId);
            await api.mockPayment(plan?.price || 0);
            await api.createSubscription(planId);
            const updatedSubs = await api.getSubscriptions();
            setSubs(updatedSubs);
            Alert.alert(t('success'), t('payment_success'));
          } catch (e: any) {
            Alert.alert(t('error'), e.message);
          } finally {
            setSubscribing(null);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary.default} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t('subscription_plans')}</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {/* Active Subscriptions */}
        {subs.filter(s => s.status === 'active').length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.activeTitle}>{t('my_subscriptions')}</Text>
            {subs.filter(s => s.status === 'active').map(sub => (
              <View key={sub.id} style={styles.activeCard}>
                <View style={styles.activeBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.status.success} />
                  <Text style={styles.activeBadgeText}>{t('active')}</Text>
                </View>
                <Text style={styles.activePlan}>{lang === 'mr' ? sub.plan_name_mr : sub.plan_name_en}</Text>
                <Text style={styles.activeDates}>
                  {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Plans */}
        {plans.map((plan, idx) => (
          <View key={plan.id} style={[styles.planCard, idx === 1 && styles.planCardFeatured]}>
            {idx === 1 && (
              <View style={styles.bestValue}>
                <Text style={styles.bestValueText}>Best Value</Text>
              </View>
            )}
            <Text style={styles.planName}>{lang === 'mr' ? plan.name_mr : plan.name_en}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.planPrice}>₹{plan.price}</Text>
              <Text style={styles.planDuration}>/ {plan.duration_days} {t('days')}</Text>
            </View>
            <Text style={styles.planDesc}>{lang === 'mr' ? plan.description_mr : plan.description_en}</Text>
            
            <View style={styles.features}>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary.default} />
                <Text style={styles.featureText}>{plan.meals_per_day} {t('meals_day')}</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary.default} />
                <Text style={styles.featureText}>{plan.duration_days} {t('days')}</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.secondary.default} />
                <Text style={styles.featureText}>₹{(plan.price / plan.duration_days).toFixed(0)}/day</Text>
              </View>
            </View>

            <TouchableOpacity
              testID={`subscribe-plan-${idx}-btn`}
              style={[styles.subscribeBtn, idx === 1 && styles.subscribeBtnFeatured]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={subscribing === plan.id}
            >
              {subscribing === plan.id ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.subscribeBtnText}>{t('subscribe')} - ₹{plan.price}</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
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
  list: { flex: 1 },
  listContent: { padding: SPACING.l },
  activeSection: { marginBottom: SPACING.l },
  activeTitle: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  activeCard: { backgroundColor: COLORS.secondary.bg, borderRadius: RADIUS.l, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: COLORS.secondary.default + '30' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.xs },
  activeBadgeText: { fontSize: FONT_SIZE.small, fontWeight: '700', color: COLORS.status.success },
  activePlan: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  activeDates: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 4 },
  planCard: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.xl, padding: SPACING.l, marginBottom: SPACING.l, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  planCardFeatured: { borderColor: COLORS.primary.default, borderWidth: 2, ...SHADOWS.medium },
  bestValue: { backgroundColor: COLORS.primary.default, paddingHorizontal: SPACING.m, paddingVertical: SPACING.xs, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.s },
  bestValueText: { fontSize: FONT_SIZE.small, fontWeight: '700', color: '#FFF' },
  planName: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.xs },
  planPrice: { fontSize: FONT_SIZE.h1, fontWeight: '800', color: COLORS.primary.default },
  planDuration: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, marginLeft: SPACING.xs },
  planDesc: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, marginTop: SPACING.s, lineHeight: 20 },
  features: { marginTop: SPACING.m },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.s },
  featureText: { fontSize: FONT_SIZE.caption, color: COLORS.text.primary },
  subscribeBtn: { backgroundColor: COLORS.primary.default, borderRadius: RADIUS.full, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.m },
  subscribeBtnFeatured: { backgroundColor: COLORS.primary.dark },
  subscribeBtnText: { color: '#FFF', fontSize: FONT_SIZE.body, fontWeight: '700' },
});
