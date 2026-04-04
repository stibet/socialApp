import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../src/services/api';
import { useStore } from '../../src/store';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<TextInput[]>([]);
  const { setToken } = useStore();

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (newOtp.every((d) => d !== '')) handleVerify(newOtp.join(''));
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, code);
      const { token, isNewUser, user } = res.data;
      if (isNewUser) {
        router.push({ pathname: '/auth/register', params: { phone: phone as string, token } });
      } else {
        await setToken(token, user);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'Hatalı kod');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <TouchableOpacity onPress={() => router.back()} style={s.back}>
        <Text style={s.backText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={s.title}>Doğrulama Kodu</Text>
      <Text style={s.subtitle}>
        <Text style={s.phone}>{phone}</Text> numarasına gönderilen 6 haneli kodu gir.
      </Text>

      <View style={s.otpRow}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(r) => { if (r) inputs.current[idx] = r; }}
            style={[s.otpBox, digit ? s.otpBoxFilled : null]}
            value={digit}
            onChangeText={(v) => handleChange(v.slice(-1), idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {loading && <Text style={s.verifying}>Doğrulanıyor...</Text>}

      <TouchableOpacity onPress={async () => {
        if (countdown > 0) return;
        await authApi.sendOtp(phone as string);
        setCountdown(60);
      }}>
        <Text style={[s.resend, countdown > 0 && s.resendDisabled]}>
          {countdown > 0 ? `Tekrar gönder (${countdown}s)` : 'Tekrar gönder'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl, paddingTop: 60 },
  back: { marginBottom: Spacing.xl },
  backText: { color: Colors.primary, fontSize: Fonts.sizes.base },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold, marginBottom: Spacing.md },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.base, marginBottom: Spacing.xxl, lineHeight: 22 },
  phone: { color: Colors.primary, fontWeight: Fonts.weights.bold },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  otpBox: { width: 48, height: 56, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border, color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, textAlign: 'center' },
  otpBoxFilled: { borderColor: Colors.primary },
  verifying: { color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.base },
  resend: { color: Colors.primary, textAlign: 'center', fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semibold },
  resendDisabled: { color: Colors.textMuted },
});
