import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../../src/services/api';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası girin');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(cleaned);
      router.push({ pathname: '/auth/otp', params: { phone: cleaned } });
    } catch (err: any) {
       Alert.alert('Hata', `${err.message} | ${err.config?.url} | ${JSON.stringify(err.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.inner}>
        <Text style={s.logo}>🎉 dambul</Text>
        <Text style={s.tagline}>Bu gece nereye çıkıyorsun?</Text>

        <View style={s.card}>
          <Text style={s.label}>Telefon Numaranı Gir</Text>
          <View style={s.inputRow}>
            <Text style={s.prefix}>+90</Text>
            <TextInput
              style={s.input}
              placeholder="5XX XXX XX XX"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={11}
            />
          </View>
          <Text style={s.hint}>SMS ile doğrulama kodu göndereceğiz.</Text>

          <TouchableOpacity
            style={[s.btn, (loading || phone.length < 10) && s.btnDisabled]}
            onPress={handleSend}
            disabled={loading || phone.length < 10}
          >
            <Text style={s.btnText}>{loading ? 'Gönderiliyor...' : 'Kod Gönder →'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          Giriş yaparak Kullanım Koşullarını kabul etmiş olursunuz.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  logo: { fontSize: Fonts.sizes.xxxl, fontWeight: Fonts.weights.extrabold, color: Colors.primary, textAlign: 'center', marginBottom: Spacing.sm },
  tagline: { fontSize: Fonts.sizes.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxxl },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semibold, marginBottom: Spacing.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  prefix: { color: Colors.textSecondary, fontSize: Fonts.sizes.base, marginRight: Spacing.sm, paddingVertical: Spacing.md },
  input: { flex: 1, color: Colors.text, fontSize: Fonts.sizes.lg, paddingVertical: Spacing.md, letterSpacing: 2 },
  hint: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginBottom: Spacing.lg },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold },
  footer: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, textAlign: 'center', marginTop: Spacing.xl },
});
