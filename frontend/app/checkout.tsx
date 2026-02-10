import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useLang } from '../src/contexts/LanguageContext';
import { api } from '../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../src/constants/theme';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isDineIn = mode === 'dine_in';

  const [qty, setQty] = useState(1);
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const PRICE = 80;
  const total = isDineIn ? guests * PRICE : qty * PRICE;

  const handleOrder = async () => {
    if (!isDineIn && !address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    setLoading(true);
    try {
      await api.mockPayment(total);
      await api.createOrder({
        items: isDineIn
          ? [{ name: 'Dine-In Unlimited Thali', qty: guests, price: PRICE }]
          : [{ name: 'Lunch Tiffin', qty, price: PRICE }],
        total,
        order_type: isDineIn ? 'dine_in' : 'single',
        delivery_address: isDineIn ? 'Dine-In at Gurukrupa Mess' : address,
        notes,
      });
      Alert.alert(t('success'), t('payment_success'), [
        { text: 'View Orders', onPress: () => router.replace('/order-history') },
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isDineIn ? t('dine_in_order') : 'Order Summary'}</Text>

          {isDineIn ? (
            <>
              <View style={styles.dineInHero}>
                <Text style={styles.dineInEmoji}>🍽️</Text>
                <View style={styles.dineInInfo}>
                  <Text style={styles.itemName}>{t('dine_in_title')}</Text>
                  <View style={styles.unlimitedBadge}>
                    <Ionicons name="infinite" size={14} color="#FFF" />
                    <Text style={styles.unlimitedText}>{t('unlimited_food')}</Text>
                  </View>
                  <Text style={styles.dineInSub}>{t('unlimited_includes')}</Text>
                </View>
                <Text style={styles.itemPrice}>₹{PRICE}</Text>
              </View>

              {/* Guest count */}
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>{t('guests')}</Text>
                <View style={styles.qtyControl}>
                  <TouchableOpacity testID="guest-minus-btn" style={styles.qtyBtn} onPress={() => setGuests(Math.max(1, guests - 1))}>
                    <Ionicons name="remove" size={20} color={COLORS.secondary.default} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{guests}</Text>
                  <TouchableOpacity testID="guest-plus-btn" style={styles.qtyBtn} onPress={() => setGuests(guests + 1)}>
                    <Ionicons name="add" size={20} color={COLORS.secondary.default} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dine-in perks */}
              <View style={styles.perksBox}>
                <Text style={styles.perksTitle}>{t('unlimited_desc')}</Text>
                {[
                  { icon: 'checkmark-circle', text: 'Unlimited Rice & Roti' },
                  { icon: 'checkmark-circle', text: 'Unlimited Dal & Sabzi' },
                  { icon: 'checkmark-circle', text: 'Salad, Pickle & Papad' },
                  { icon: 'checkmark-circle', text: 'Sweet (on special days)' },
                  { icon: 'location', text: t('walk_in') },
                ].map((perk, idx) => (
                  <View key={idx} style={styles.perkRow}>
                    <Ionicons name={perk.icon as any} size={16} color={COLORS.secondary.default} />
                    <Text style={styles.perkText}>{perk.text}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.itemRow}>
                <Text style={styles.emoji}>🍱</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>Lunch Tiffin</Text>
                  <Text style={styles.itemDesc}>Dal + Rice + Roti + Sabzi + Salad</Text>
                </View>
                <Text style={styles.itemPrice}>₹{PRICE}</Text>
              </View>
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>Quantity</Text>
                <View style={styles.qtyControl}>
                  <TouchableOpacity testID="qty-minus-btn" style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
                    <Ionicons name="remove" size={20} color={COLORS.primary.default} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qty}</Text>
                  <TouchableOpacity testID="qty-plus-btn" style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
                    <Ionicons name="add" size={20} color={COLORS.primary.default} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Delivery Address - only for delivery */}
        {!isDineIn && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <TextInput
              testID="checkout-address-input"
              style={styles.textarea}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter delivery address"
              placeholderTextColor={COLORS.text.muted}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Dine-in location info */}
        {isDineIn && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dine-In Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={20} color={COLORS.secondary.default} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>Gurukrupa Mess</Text>
                <Text style={styles.locationAddr}>Pune, Maharashtra</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="time" size={20} color={COLORS.secondary.default} />
              <Text style={styles.locationAddr}>11:00 AM - 3:00 PM & 7:00 PM - 10:00 PM</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Special Notes</Text>
          <TextInput
            testID="checkout-notes-input"
            style={styles.textarea}
            value={notes}
            onChangeText={setNotes}
            placeholder={isDineIn ? "e.g., Allergies, jain food..." : "e.g., Extra chapati, no spice..."}
            placeholderTextColor={COLORS.text.muted}
            multiline
          />
        </View>

        {/* Payment Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Ionicons name="card-outline" size={20} color={COLORS.text.secondary} />
            <Text style={styles.paymentText}>Razorpay (Mock)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottom}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total {isDineIn ? `(${guests} guest${guests > 1 ? 's' : ''})` : ''}</Text>
            {isDineIn && <Text style={styles.totalSub}>₹{PRICE}/person - Unlimited food</Text>}
          </View>
          <Text style={styles.totalPrice}>₹{total}</Text>
        </View>
        <TouchableOpacity
          testID="place-order-btn"
          style={[styles.orderBtn, isDineIn && styles.dineInOrderBtn]}
          onPress={handleOrder}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : (
            <Text style={styles.orderBtnText}>{t('pay')} ₹{total}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  scroll: { flex: 1 },
  content: { padding: SPACING.l },
  card: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.l, marginBottom: SPACING.m, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, borderWidth: 1, borderColor: '#F5F5F4' },
  cardTitle: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 40, marginRight: SPACING.m },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  itemDesc: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 2 },
  itemPrice: { fontSize: FONT_SIZE.h3, fontWeight: '800', color: COLORS.primary.default },
  dineInHero: { flexDirection: 'row', alignItems: 'center' },
  dineInEmoji: { fontSize: 40, marginRight: SPACING.m },
  dineInInfo: { flex: 1 },
  dineInSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 4 },
  unlimitedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.secondary.default, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginTop: 4 },
  unlimitedText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  perksBox: { marginTop: SPACING.m, backgroundColor: COLORS.secondary.bg, borderRadius: RADIUS.m, padding: SPACING.m },
  perksTitle: { fontSize: FONT_SIZE.caption, fontWeight: '700', color: COLORS.secondary.dark, marginBottom: SPACING.s },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: 6 },
  perkText: { fontSize: FONT_SIZE.small, color: COLORS.text.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.m, paddingTop: SPACING.m, borderTopWidth: 1, borderTopColor: '#F5F5F4' },
  qtyLabel: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary.bg, justifyContent: 'center', alignItems: 'center' },
  qtyValue: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary, minWidth: 30, textAlign: 'center' },
  textarea: { backgroundColor: COLORS.background.subtle, borderRadius: RADIUS.m, padding: SPACING.m, fontSize: FONT_SIZE.body, color: COLORS.text.primary, borderWidth: 1, borderColor: '#E7E5E4', textAlignVertical: 'top', minHeight: 60 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.m },
  locationName: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  locationAddr: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s },
  paymentText: { fontSize: FONT_SIZE.body, color: COLORS.text.secondary },
  bottom: { padding: SPACING.l, backgroundColor: COLORS.background.paper, borderTopWidth: 1, borderTopColor: '#E7E5E4' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.m },
  totalLabel: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  totalSub: { fontSize: FONT_SIZE.small, color: COLORS.text.muted, marginTop: 2 },
  totalPrice: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.primary.default },
  orderBtn: { backgroundColor: COLORS.primary.default, borderRadius: RADIUS.full, paddingVertical: 16, alignItems: 'center' },
  dineInOrderBtn: { backgroundColor: COLORS.secondary.default },
  orderBtnText: { color: '#FFF', fontSize: FONT_SIZE.body, fontWeight: '700' },
});
