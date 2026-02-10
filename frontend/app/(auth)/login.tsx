import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LanguageContext';
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '../../src/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation handled by index.tsx effect
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid credentials');
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
            <Text style={styles.subtitle}>गुरुकृपा मेस</Text>
            <Text style={styles.tagline}>Taste of Home | घरच्या जेवणाची चव</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>{t('login')}</Text>
            
            <View style={styles.inputWrap}>
              <Text style={styles.label}>{t('email')}</Text>
              <TextInput
                testID="login-email-input"
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.label}>{t('password')}</Text>
              <TextInput
                testID="login-password-input"
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity testID="login-submit-btn" style={styles.btn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{t('login')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity testID="go-to-register-btn" style={styles.linkWrap} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>{t('dont_have_account')} </Text>
              <Text style={styles.linkBold}>{t('register')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <Text style={styles.demoText}>Customer: rahul@test.com / test123</Text>
            <Text style={styles.demoText}>Admin: admin@gurukrupa.com / admin123</Text>
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
  header: { alignItems: 'center', marginTop: SPACING.xl, marginBottom: SPACING.xl },
  logo: { fontSize: 64 },
  title: { fontSize: FONT_SIZE.h1, fontWeight: '800', color: COLORS.primary.default, marginTop: SPACING.s },
  subtitle: { fontSize: FONT_SIZE.h3, color: COLORS.primary.dark, marginTop: SPACING.xs },
  tagline: { fontSize: FONT_SIZE.caption, color: COLORS.text.secondary, marginTop: SPACING.s },
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
  demoBox: { marginTop: SPACING.l, padding: SPACING.m, backgroundColor: COLORS.primary.bg, borderRadius: RADIUS.m, borderWidth: 1, borderColor: COLORS.primary.default + '30' },
  demoTitle: { fontSize: FONT_SIZE.caption, fontWeight: '700', color: COLORS.primary.dark, marginBottom: SPACING.xs },
  demoText: { fontSize: FONT_SIZE.small, color: COLORS.text.secondary, marginTop: 2 },
});
