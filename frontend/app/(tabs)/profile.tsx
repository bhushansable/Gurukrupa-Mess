import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LanguageContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser, isAdmin } = useAuth();
  const { t, lang, setLang } = useLang();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ name, phone, address });
      setEditing(false);
      Alert.alert(t('success'), 'Profile updated');
    } catch (e: any) {
      Alert.alert(t('error'), e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('logout'), 'Are you sure?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => { logout(); router.replace('/'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.headerTitle}>{t('profile')}</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          {!editing ? (
            <>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
              {user?.address ? <Text style={styles.profileAddress}>{user.address}</Text> : null}
              <TouchableOpacity testID="edit-profile-btn" style={styles.editBtn} onPress={() => setEditing(true)}>
                <Ionicons name="pencil" size={16} color={COLORS.primary.default} />
                <Text style={styles.editBtnText}>{t('edit_profile')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput testID="profile-name-input" style={styles.input} value={name} onChangeText={setName} placeholder={t('name')} placeholderTextColor={COLORS.text.muted} />
              <TextInput testID="profile-phone-input" style={styles.input} value={phone} onChangeText={setPhone} placeholder={t('phone')} placeholderTextColor={COLORS.text.muted} keyboardType="phone-pad" />
              <TextInput testID="profile-address-input" style={styles.input} value={address} onChangeText={setAddress} placeholder={t('address')} placeholderTextColor={COLORS.text.muted} multiline />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="save-profile-btn" style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>{t('save')}</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Language Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              testID="lang-en-btn"
              style={[styles.langChip, lang === 'en' && styles.langChipActive]}
              onPress={() => setLang('en')}
            >
              <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="lang-mr-btn"
              style={[styles.langChip, lang === 'mr' && styles.langChipActive]}
              onPress={() => setLang('mr')}
            >
              <Text style={[styles.langText, lang === 'mr' && styles.langTextActive]}>मराठी</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          {[
            { icon: 'time', label: t('my_orders'), route: '/order-history', testId: 'profile-orders-btn' },
            { icon: 'card', label: t('my_subscriptions'), route: '/(tabs)/plans', testId: 'profile-subs-btn' },
            { icon: 'chatbubbles', label: t('support'), route: '/support', testId: 'profile-support-btn' },
            ...(isAdmin ? [{ icon: 'shield', label: t('admin_panel'), route: '/(admin)/dashboard', testId: 'profile-admin-btn' }] : []),
          ].map((item, idx) => (
            <TouchableOpacity key={idx} testID={item.testId} style={styles.linkItem} onPress={() => router.push(item.route as any)}>
              <Ionicons name={item.icon as any} size={22} color={COLORS.primary.default} />
              <Text style={styles.linkText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity testID="logout-btn" style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.status.error} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  scroll: { flex: 1 },
  content: { padding: SPACING.l },
  headerTitle: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.text.primary, marginBottom: SPACING.l },
  profileCard: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.xl, padding: SPACING.l, alignItems: 'center', ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4', marginBottom: SPACING.l },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary.default, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.m },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary },
  profileEmail: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, marginTop: 4 },
  profilePhone: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, marginTop: 2 },
  profileAddress: { fontSize: FONT_SIZE.small, color: COLORS.text.muted, marginTop: 4, textAlign: 'center' },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.m, paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.full, backgroundColor: COLORS.primary.bg },
  editBtnText: { fontSize: FONT_SIZE.caption, fontWeight: '600', color: COLORS.primary.default },
  input: { width: '100%', backgroundColor: COLORS.background.subtle, borderRadius: RADIUS.m, padding: SPACING.m, fontSize: FONT_SIZE.body, color: COLORS.text.primary, borderWidth: 1, borderColor: '#E7E5E4', marginTop: SPACING.s },
  editActions: { flexDirection: 'row', gap: SPACING.m, marginTop: SPACING.m, width: '100%' },
  cancelBtn: { flex: 1, borderRadius: RADIUS.full, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E7E5E4' },
  cancelBtnText: { fontSize: FONT_SIZE.caption, fontWeight: '600', color: COLORS.text.secondary },
  saveBtn: { flex: 1, borderRadius: RADIUS.full, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.primary.default },
  saveBtnText: { fontSize: FONT_SIZE.caption, fontWeight: '700', color: '#FFF' },
  section: { marginBottom: SPACING.l },
  sectionTitle: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.m },
  langRow: { flexDirection: 'row', gap: SPACING.m },
  langChip: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.full, alignItems: 'center', backgroundColor: COLORS.background.paper, borderWidth: 1, borderColor: '#E7E5E4' },
  langChipActive: { backgroundColor: COLORS.primary.default, borderColor: COLORS.primary.default },
  langText: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.text.secondary },
  langTextActive: { color: '#FFF' },
  linkItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background.paper, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.s, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4', gap: SPACING.m },
  linkText: { flex: 1, fontSize: FONT_SIZE.body, fontWeight: '500', color: COLORS.text.primary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.s, paddingVertical: 14, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.status.error + '40' },
  logoutText: { fontSize: FONT_SIZE.body, fontWeight: '600', color: COLORS.status.error },
});
