import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LanguageContext';
import { api } from '../../src/utils/api';
import { COLORS, SPACING, RADIUS, FONT_SIZE, SHADOWS } from '../../src/constants/theme';

const DAYS = ['daily', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const CATEGORIES = ['dal', 'roti', 'rice', 'sabzi', 'sweet', 'salad', 'extra'];

export default function AdminMenuManage() {
  const { lang } = useLang();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name_en: '', name_mr: '', description_en: '', description_mr: '', category: 'sabzi', day_of_week: 'daily' });

  const fetchItems = useCallback(async () => {
    try {
      const data = await api.getMenu();
      setItems(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    if (!form.name_en.trim() || !form.name_mr.trim()) {
      Alert.alert('Error', 'Name in both languages is required');
      return;
    }
    try {
      await api.createMenuItem({ ...form, price: 0, is_available: true, image_url: '' });
      setShowModal(false);
      setForm({ name_en: '', name_mr: '', description_en: '', description_mr: '', category: 'sabzi', day_of_week: 'daily' });
      fetchItems();
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.deleteMenuItem(id); fetchItems(); } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.cardInfo}>
          <Text style={styles.itemName}>{lang === 'mr' ? item.name_mr : item.name_en}</Text>
          <Text style={styles.itemDesc}>{lang === 'mr' ? item.description_mr : item.description_en}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}><Text style={styles.tagText}>{item.category}</Text></View>
            <View style={[styles.tag, { backgroundColor: COLORS.secondary.bg }]}><Text style={[styles.tagText, { color: COLORS.secondary.default }]}>{item.day_of_week}</Text></View>
          </View>
        </View>
        <TouchableOpacity testID={`delete-menu-${item.id}-btn`} style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.name_en)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.status.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(); }} tintColor={COLORS.primary.default} />}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No menu items</Text></View>}
      />

      {/* FAB */}
      <TouchableOpacity testID="add-menu-item-btn" style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Menu Item</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TextInput testID="menu-name-en-input" style={styles.input} placeholder="Name (English)" placeholderTextColor={COLORS.text.muted} value={form.name_en} onChangeText={v => setForm({ ...form, name_en: v })} />
              <TextInput testID="menu-name-mr-input" style={styles.input} placeholder="Name (Marathi)" placeholderTextColor={COLORS.text.muted} value={form.name_mr} onChangeText={v => setForm({ ...form, name_mr: v })} />
              <TextInput style={styles.input} placeholder="Description (English)" placeholderTextColor={COLORS.text.muted} value={form.description_en} onChangeText={v => setForm({ ...form, description_en: v })} />
              <TextInput style={styles.input} placeholder="Description (Marathi)" placeholderTextColor={COLORS.text.muted} value={form.description_mr} onChangeText={v => setForm({ ...form, description_mr: v })} />
              
              <Text style={styles.selectLabel}>Category</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.chip, form.category === c && styles.chipActive]} onPress={() => setForm({ ...form, category: c })}>
                    <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.selectLabel}>Day</Text>
              <View style={styles.chipRow}>
                {DAYS.map(d => (
                  <TouchableOpacity key={d} style={[styles.chip, form.day_of_week === d && styles.chipActive]} onPress={() => setForm({ ...form, day_of_week: d })}>
                    <Text style={[styles.chipText, form.day_of_week === d && styles.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity testID="save-menu-item-btn" style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Add Item</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  list: { padding: SPACING.m },
  card: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.s, ...SHADOWS.small, borderWidth: 1, borderColor: '#F5F5F4' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZE.body, fontWeight: '700', color: COLORS.text.primary },
  itemDesc: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.s },
  tag: { backgroundColor: COLORS.primary.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  tagText: { fontSize: 10, fontWeight: '600', color: COLORS.primary.default, textTransform: 'uppercase' },
  deleteBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.status.error + '10', justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyText: { fontSize: FONT_SIZE.body, color: COLORS.text.muted },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary.default, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.background.paper, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.l, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
  modalTitle: { fontSize: FONT_SIZE.h3, fontWeight: '700', color: COLORS.text.primary },
  input: { backgroundColor: COLORS.background.subtle, borderRadius: RADIUS.m, padding: SPACING.m, fontSize: FONT_SIZE.body, color: COLORS.text.primary, borderWidth: 1, borderColor: '#E7E5E4', marginBottom: SPACING.m },
  selectLabel: { fontSize: FONT_SIZE.caption, fontWeight: '600', color: COLORS.text.secondary, marginBottom: SPACING.s },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.m },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.background.subtle, borderWidth: 1, borderColor: '#E7E5E4' },
  chipActive: { backgroundColor: COLORS.primary.default, borderColor: COLORS.primary.default },
  chipText: { fontSize: FONT_SIZE.small, fontWeight: '600', color: COLORS.text.secondary },
  chipTextActive: { color: '#FFF' },
  saveBtn: { backgroundColor: COLORS.primary.default, borderRadius: RADIUS.full, paddingVertical: 14, alignItems: 'center', marginTop: SPACING.m, marginBottom: SPACING.xl },
  saveBtnText: { color: '#FFF', fontSize: FONT_SIZE.body, fontWeight: '700' },
});
