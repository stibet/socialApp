import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { groupsApi, reviewsApi } from '../../src/services/api';
import { Group } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';
import { useStore } from '../../src/store';

export default function ReviewScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { user } = useStore();

  useFocusEffect(useCallback(() => {
    groupsApi.getOne(groupId).then((res) => { setGroup(res.data); }).finally(() => setLoading(false));
  }, [groupId]));

  const handleSubmit = async (memberId: string) => {
    const rating = ratings[memberId];
    if (!rating) { Alert.alert('Hata', 'Puan seçin'); return; }
    setSaving(true);
    try {
      await reviewsApi.create({ revieweeId: memberId, groupId, rating, comment: comments[memberId]?.trim() || undefined });
      setSubmitted((p) => ({ ...p, [memberId]: true }));
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'Puan gönderilemedi');
    } finally { setSaving(false); }
  };

  if (loading || !group) return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const otherMembers = group.members.filter((m) => m.userId !== user?.id);
  const allDone = otherMembers.every((m) => submitted[m.userId]);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.backText}>←</Text></TouchableOpacity>
          <Text style={s.title}>Üyeleri Puanla</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={s.subtitle}>Bu etkinlik nasıl geçti? Birlikte çıktığın kişileri puanla.</Text>

        {otherMembers.map((member) => (
          <View key={member.userId} style={[s.memberCard, submitted[member.userId] && s.memberCardDone]}>
            <View style={s.memberTop}>
              <View style={s.avatar}><Text style={s.avatarText}>{member.user?.name?.[0]?.toUpperCase()}</Text></View>
              <Text style={s.memberName}>{member.user?.name}</Text>
              {submitted[member.userId] && (
                <View style={s.doneBadge}><Text style={s.doneText}>✓ Gönderildi</Text></View>
              )}
            </View>

            {!submitted[member.userId] && (
              <>
                <View style={s.starsRow}>
                  {[1,2,3,4,5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRatings((p) => ({ ...p, [member.userId]: star }))}>
                      <Text style={s.starIcon}>{star <= (ratings[member.userId] || 0) ? '⭐' : '☆'}</Text>
                    </TouchableOpacity>
                  ))}
                  {ratings[member.userId] && <Text style={s.ratingLabel}> {ratings[member.userId]}/5</Text>}
                </View>
                <TextInput
                  style={s.commentInput}
                  placeholder="Yorum yaz (opsiyonel)..."
                  placeholderTextColor={Colors.textMuted}
                  value={comments[member.userId] || ''}
                  onChangeText={(v) => setComments((p) => ({ ...p, [member.userId]: v }))}
                  maxLength={200}
                  multiline
                />
                <TouchableOpacity
                  style={[s.submitBtn, (!ratings[member.userId] || saving) && s.submitBtnDisabled]}
                  onPress={() => handleSubmit(member.userId)}
                  disabled={!ratings[member.userId] || saving}
                >
                  <Text style={s.submitBtnText}>Puanı Gönder</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}

        {allDone && (
          <TouchableOpacity style={s.doneBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={s.doneBtnText}>Tamamlandı 🎉</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, marginBottom: Spacing.md },
  backText: { color: Colors.primary, fontSize: 24, width: 40 },
  title: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  subtitle: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginBottom: Spacing.xl, lineHeight: 20 },
  memberCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  memberCardDone: { borderColor: Colors.success + '66', backgroundColor: Colors.success + '11' },
  memberTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.text, fontWeight: Fonts.weights.bold },
  memberName: { flex: 1, color: Colors.text, fontWeight: Fonts.weights.semibold },
  doneBadge: { backgroundColor: Colors.success + '33', borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  doneText: { color: Colors.success, fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.bold },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  starIcon: { fontSize: 28, marginRight: 4 },
  ratingLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  commentInput: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text, padding: Spacing.sm, fontSize: Fonts.sizes.sm, marginBottom: Spacing.md, minHeight: 60, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: Colors.text, fontWeight: Fonts.weights.bold },
  doneBtn: { backgroundColor: Colors.success, borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center', marginTop: Spacing.lg },
  doneBtnText: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.base },
});
