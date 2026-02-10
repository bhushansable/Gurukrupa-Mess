import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LanguageContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../src/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, address: address.trim() });
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🍱</Text>
            <Text style={styles.title}>Gurukrupa Mess</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>{t('register')}</Text>
            
            {[
              { label: t('name'), val: name, set: setName, placeholder: 'Enter full name', key: 'default' as const, testId: 'register-name-input' },
              { label: t('email'), val: email, set: setEmail, placeholder: 'Enter email', key: 'email-address' as const, testId: 'register-email-input' },
              { label: t('phone'), val: phone, set: setPhone, placeholder: 'Enter phone number', key: 'phone-pad' as const, testId: 'register-phone-input' },
              { label: t('address'), val: address, set: setAddress, placeholder: 'Enter delivery address', key: 'default' as const, testId: 'register-address-input' },
            ].map((f, i) => (
              <View key={i} style={styles.inputWrap}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput testID={f.testId} style={styles.input} placeholder={f.placeholder} placeholderTextColor={COLORS.text.muted} value={f.val} onChangeText={f.set} keyboardType={f.key} autoCapitalize={f.key === 'email-address' ? 'none' : 'words'} />
              </View>
            ))}

            <View style={styles.inputWrap}>
              <Text style={styles.label}>{t('password')}</Text>
              <TextInput testID="register-password-input" style={styles.input} placeholder="Create password" placeholderTextColor={COLORS.text.muted} value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <TouchableOpacity testID="register-submit-btn" style={styles.btn} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{t('register')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity testID="go-to-login-btn" style={styles.linkWrap} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.linkText}>{t('already_have_account')} </Text>
              <Text style={styles.linkBold}>{t('login')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background.default },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.l },
  header: { alignItems: 'center', marginTop: SPACING.l, marginBottom: SPACING.l },
  logo: { fontSize: 48 },
  title: { fontSize: FONT_SIZE.h2, fontWeight: '800', color: COLORS.primary.default, marginTop: SPACING.xs },
  form: { backgroundColor: COLORS.background.paper, borderRadius: RADIUS.l, padding: SPACING.l, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  formTitle: { fontSize: FONT_SIZE.h2, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.l },
  inputWrap: { marginBottom: SPACING.m },
  label: { fontSize: FONT_SIZE.caption, fontWeight: '600', color: COLORS.text.secondary, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.background.subtle, borderRadius: RADIUS.m, padding: SPACING.m, fontSize: FONT_SIZE.body, color: COLORS.text.primary, borderWidth: 1, borderColor: '#E7E5E4' },
  btn: { backgroundColor: COLORS.primary.default, borderRadius: RADIUS.full, paddingVertical: SPACING.m, alignItems: 'center', marginTop: SPACING.m },
  btnText: { color: COLORS.text.inverted, fontSize: FONT_SIZE.body, fontWeight: '700' },
  linkWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.l },
  linkText: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary },
  linkBold: { fontSize: FONT_SIZE.caption, color: COLORS.primary.default, fontWeight: '700' },
});
