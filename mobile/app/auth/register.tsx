import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../../src/store';
import { authApi } from '../../src/services/api';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

const GENDERS = [
  { value: 'male', label: '👨 Erkek' },
  { value: 'female', label: '👩 Kadın' },
  { value: 'other', label: '🧑 Diğer' },
];

export default function RegisterScreen() {
  const { phone, token } = useLocalSearchParams<{ phone: string; token: string }>();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken } = useStore();

  const handleRegister = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Hata', 'Geçerli bir isim girin');
      return;
    }
    if (!gender) {
      Alert.alert('Hata', 'Cinsiyet seçin');
      return;
    }
    setLoading(true);
    try {
      // verifyOtp'u isim ve cinsiyet ile tekrar çağır
      const res = await authApi.verifyOtp(
        phone as string,
        '', // otp boş — backend'de token zaten var
        name.trim(),
        gender,
      );
      await setToken(res.data.token || token as string, res.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      // Direkt token ile devam et
      try {
        await setToken(token as string, {
          id: '',
          phone: phone as string,
          name: name.trim(),
          gender: gender as any,
          trustScore: 0,
          totalMeetups: 0,
        });
        router.replace('/(tabs)');
      } catch (e) {
        Alert.alert('Hata', 'Kayıt tamamlanamadı');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Profil Oluştur</Text>
      <Text style={s.subtitle}>Bir kere doldurman yeterli 🎉</Text>

      <Text style={s.label}>İsmin</Text>
      <TextInput
        style={s.input}
        placeholder="Adın ne?"
        placeholderTextColor={Colors.textMuted}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        maxLength={40}
      />

      <Text style={s.label}>Cinsiyetin</Text>
      <View style={s.genderRow}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g.value}
            style={[s.genderBtn, gender === g.value && s.genderBtnActive]}
            onPress={() => setGender(g.value)}
          >
            <Text style={[s.genderText, gender === g.value && s.genderTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoText}>
          ℹ️ Cinsiyetin grup ilanlarında görünür. Mekan politikaları nedeniyle bu bilgi gereklidir.
        </Text>
      </View>

      <TouchableOpacity
        style={[s.btn, (loading || !name || !gender) && s.btnDisabled]}
        onPress={handleRegister}
        disabled={loading || !name.trim() || !gender}
      >
        <Text style={s.btnText}>{loading ? 'Kaydediliyor...' : 'Hadi Başlayalım 🚀'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: Spacing.xl, paddingTop: 60 },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold, marginBottom: Spacing.sm },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.base, marginBottom: Spacing.xxl },
  label: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semibold, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text, fontSize: Fonts.sizes.base, padding: Spacing.base },
  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  genderBtn: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center' },
  genderBtnActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  genderText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semibold },
  genderTextActive: { color: Colors.primary },
  infoBox: { backgroundColor: Colors.info + '22', borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xl, borderWidth: 1, borderColor: Colors.info + '44' },
  infoText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, lineHeight: 18 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center', marginTop: Spacing.xl },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold },
});