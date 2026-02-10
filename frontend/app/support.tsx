import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../src/contexts/LanguageContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../src/constants/theme';

const WHATSAPP_NUMBER = '919876543210';
const PHONE_NUMBER = '9876543210';

const FAQS = [
  { q_en: 'What is included in a tiffin?', q_mr: 'डब्यात काय असते?', a_en: 'Each tiffin includes Dal, Rice, 4 Chapatis, Sabzi (vegetable), and Salad.', a_mr: 'प्रत्येक डब्यात डाळ, भात, ४ चपात्या, भाजी आणि सॅलड असतो.' },
  { q_en: 'What are the delivery timings?', q_mr: 'डिलिव्हरीची वेळ काय आहे?', a_en: 'Lunch: 11:30 AM - 1:30 PM, Dinner: 7:00 PM - 9:00 PM', a_mr: 'दुपार: ११:३० - १:३०, रात्री: ७:०० - ९:००' },
  { q_en: 'Can I cancel my subscription?', q_mr: 'मी सदस्यता रद्द करू शकतो का?', a_en: 'Yes, you can cancel anytime. Contact us via WhatsApp for cancellation.', a_mr: 'हो, तुम्ही कधीही रद्द करू शकता. रद्द करण्यासाठी व्हॉट्सॲपवर संपर्क करा.' },
  { q_en: 'Do you deliver on Sundays?', q_mr: 'रविवारी डिलिव्हरी होते का?', a_en: 'Yes! We deliver 7 days a week with special Sunday menu.', a_mr: 'हो! आम्ही आठवड्याचे ७ दिवस डिलिव्हरी करतो, रविवारचा स्पेशल मेनू असतो.' },
];

export default function SupportScreen() {
  const { t, lang } = useLang();

  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=Hello Gurukrupa Mess!`);
  };

  const callUs = () => {
    Linking.openURL(`tel:${PHONE_NUMBER}`);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Contact Cards */}
      <View style={styles.contactRow}>
        <TouchableOpacity testID="whatsapp-btn" style={[styles.contactCard, { backgroundColor: '#25D366' }]} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={32} color="#FFF" />
          <Text style={styles.contactLabel}>{t('whatsapp_us')}</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="call-btn" style={[styles.contactCard, { backgroundColor: COLORS.primary.default }]} onPress={callUs}>
          <Ionicons name="call" size={32} color="#FFF" />
          <Text style={styles.contactLabel}>{t('call_us')}</Text>
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Gurukrupa Mess</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={18} color={COLORS.primary.default} />
          <Text style={styles.infoText}>Pune, Maharashtra, India</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={18} color={COLORS.primary.default} />
          <Text style={styles.infoText}>Mon-Sun: 11:00 AM - 9:00 PM</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={18} color={COLORS.primary.default} />
          <Text style={styles.infoText}>contact@gurukrupamess.com</Text>
        </View>
      </View>

      {/* FAQ */}
      <Text style={styles.faqTitle}>{t('faq')}</Text>
      {FAQS.map((faq, idx) => (
        <View key={idx} style={styles.faqCard}>
          <View style={styles.faqQ}>
            <Ionicons name="help-circle" size={20} color={COLORS.primary.default} />
            <Text style={styles.faqQText}>{lang === 'mr' ? faq.q_mr : faq.q_en}</Text>
          </View>
          <Text style={styles.faqA}>{lang === 'mr' ? faq.a_mr : faq.a_en}</Text>
        </View>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background.default },
  content: { padding: SPACING.l },
  contactRow: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.l },
  contactCard: { flex: 1, borderRadius: RADIUS.xl, padding: SPACING.l, alignItems: 'center', ...SHADOWS.medium },
  contactLabel: { fontSize: FONT_SIZE.caption, fontWeight: '700', color: '#FFF', marginTop: SPACING.s },
  infoCard: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.l, marginBottom: SPACING.l, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  infoTitle: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.m },
  infoText: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary },
  faqTitle: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  faqCard: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  faqQ: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.s },
  faqQText: { flex: 1, fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.primary },
  faqA: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, lineHeight: 20, paddingLeft: 28 },
});
