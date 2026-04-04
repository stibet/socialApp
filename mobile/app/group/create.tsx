import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { groupsApi } from '../../src/services/api';
import { OfferType, OFFER_LABELS } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

const OFFER_OPTIONS: { type: OfferType; emoji: string; desc: string }[] = [
  { type: 'none', emoji: '🤝', desc: 'Sadece birlikte çıkıyoruz' },
  { type: '2drink', emoji: '🍺', desc: '2 yerli içecek ısmarlayacağım' },
  { type: '3drink', emoji: '🍺🍺', desc: '3 yerli içecek ısmarlayacağım' },
  { type: 'custom', emoji: '✍️', desc: 'Kendi notumu yazayım' },
];

export default function CreateGroupScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [offerType, setOfferType] = useState<OfferType>('none');
  const [customNote, setCustomNote] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (offerType === 'custom' && !customNote.trim()) {
      Alert.alert('Hata', 'Özel not girmelisiniz');
      return;
    }
    setLoading(true);
    try {
      const res = await groupsApi.create({
        eventId,
        offerType,
        customNote: offerType === 'custom' ? customNote.trim() : undefined,
        maxMembers: parseInt(maxMembers) || 10,
      });
      router.replace({ pathname: '/group/[id]', params: { id: res.data.id } });
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'Grup oluşturulamadı');
    } finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.backText}>←</Text></TouchableOpacity>
          <Text style={s.title}>Grup Oluştur</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={s.sectionLabel}>Teklifin ne?</Text>
        <Text style={s.sectionHint}>Gruba katılacak kişilere ne teklif ediyorsun?</Text>

        {OFFER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            style={[s.offerCard, offerType === opt.type && s.offerCardActive]}
            onPress={() => setOfferType(opt.type)}
          >
            <Text style={s.offerEmoji}>{opt.emoji}</Text>
            <View style={s.offerInfo}>
              <Text style={[s.offerLabel, offerType === opt.type && s.offerLabelActive]}>{OFFER_LABELS[opt.type]}</Text>
              <Text style={s.offerDesc}>{opt.desc}</Text>
            </View>
            <View style={[s.radio, offerType === opt.type && s.radioActive]}>
              {offerType === opt.type && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {offerType === 'custom' && (
          <View style={s.noteBox}>
            <Text style={s.noteLabel}>Notun</Text>
            <TextInput
              style={s.noteInput}
              placeholder="Örn: Bir tur benden, eğlenceli bir gece geçirelim..."
              placeholderTextColor={Colors.textMuted}
              value={customNote}
              onChangeText={setCustomNote}
              multiline
              maxLength={300}
            />
            <Text style={s.charCount}>{customNote.length}/300</Text>
          </View>
        )}

        <View style={s.field}>
          <Text style={s.fieldLabel}>Maksimum katılımcı sayısı</Text>
          <View style={s.counterRow}>
            {['4','6','8','10','15'].map((n) => (
              <TouchableOpacity
                key={n}
                style={[s.counterBtn, maxMembers === n && s.counterBtnActive]}
                onPress={() => setMaxMembers(n)}
              >
                <Text style={[s.counterText, maxMembers === n && s.counterTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoText}>💡 İçecek teklifi sadece söz — ödeme mekanda yapılır. Dambul para transferi yapmaz.</Text>
        </View>
      </ScrollView>

      <View style={s.bottom}>
        <TouchableOpacity
          style={[s.createBtn, loading && s.createBtnDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={s.createBtnText}>{loading ? 'Oluşturuluyor...' : 'Grubu Oluştur 🚀'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, marginBottom: Spacing.xl },
  backText: { color: Colors.primary, fontSize: 24, width: 40 },
  title: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  sectionLabel: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, marginBottom: Spacing.xs },
  sectionHint: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginBottom: Spacing.lg },
  offerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 2, borderColor: Colors.border, gap: Spacing.md },
  offerCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '11' },
  offerEmoji: { fontSize: 28 },
  offerInfo: { flex: 1 },
  offerLabel: { color: Colors.textSecondary, fontWeight: Fonts.weights.semibold, fontSize: Fonts.sizes.base },
  offerLabelActive: { color: Colors.text },
  offerDesc: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  noteBox: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  noteLabel: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.semibold, marginBottom: Spacing.sm },
  noteInput: { color: Colors.text, fontSize: Fonts.sizes.base, minHeight: 80, textAlignVertical: 'top' },
  charCount: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, textAlign: 'right', marginTop: Spacing.sm },
  field: { marginBottom: Spacing.lg },
  fieldLabel: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.semibold, marginBottom: Spacing.md },
  counterRow: { flexDirection: 'row', gap: Spacing.sm },
  counterBtn: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  counterBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '22' },
  counterText: { color: Colors.textSecondary, fontWeight: Fonts.weights.bold },
  counterTextActive: { color: Colors.primary },
  infoBox: { backgroundColor: Colors.info + '22', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.info + '44' },
  infoText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, lineHeight: 18 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, paddingBottom: 32, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  createBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center' },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold },
});
