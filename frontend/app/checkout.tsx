import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useLang } from '../src/contexts/LanguageContext';
import { api } from '../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../src/constants/theme';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const PRICE = 80;
  const total = qty * PRICE;

  const handleOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    setLoading(true);
    try {
      await api.mockPayment(total);
      await api.createOrder({
        items: [{ name: 'Lunch Tiffin', qty, price: PRICE }],
        total,
        order_type: 'single',
        delivery_address: address,
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
          <Text style={styles.cardTitle}>Order Summary</Text>
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
        </View>

        {/* Delivery Address */}
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

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Special Notes</Text>
          <TextInput
            testID="checkout-notes-input"
            style={styles.textarea}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Extra chapati, no spice..."
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
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{total}</Text>
        </View>
        <TouchableOpacity testID="place-order-btn" style={styles.orderBtn} onPress={handleOrder} disabled={loading}>
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
  card: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.l, marginBottom: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  cardTitle: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  emoji: { fontSize: 40, marginRight: SPACING.m },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  itemDesc: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 2 },
  itemPrice: { fontSize: FONT_SIZE.h3, fontWeight: '800', color: COLORS.primary.default },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.m, paddingTop: SPACING.m, borderTopWidth: 1, borderTopColor: '#F5F5F4' },
  qtyLabel: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary.bg, justifyContent: 'center', alignItems: 'center' },
  qtyValue: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary, minWidth: 30, textAlign: 'center' },
  textarea: { backgroundColor: COLORS.background.subtle, borderRadius: RADIUS.m, padding: SPACING.m, fontSize: FONT_SIZE.body, color: COLORS.text.primary, borderWidth: 1, borderColor: '#E7E5E4', textAlignVertical: 'top', minHeight: 60 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s },
  paymentText: { fontSize: FONT_SIZE.body, color: COLORS.text.secondary },
  bottom: { padding: SPACING.l, backgroundColor: COLORS.background.paper, borderTopWidth: 1, borderTopColor: '#E7E5E4' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.m },
  totalLabel: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  totalPrice: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.primary.default },
  orderBtn: { backgroundColor: COLORS.primary.default, borderRadius: RADIUS.full, paddingVertical: 16, alignItems: 'center' },
  orderBtnText: { color: '#FFF', fontSize: FONT_SIZE.body, fontWeight: '700' },
});
