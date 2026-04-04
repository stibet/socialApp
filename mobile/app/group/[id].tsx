import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { groupsApi } from '../../src/services/api';
import { Group, OFFER_LABELS, OFFER_COLORS } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';
import { useStore } from '../../src/store';

const GENDER_EMOJI: Record<string, string> = { male: '👨', female: '👩', other: '🧑' };

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  const load = async () => {
    try {
      const res = await groupsApi.getOne(id);
      setGroup(res.data);
    } catch {
      Alert.alert('Hata', 'Grup yüklenemedi');
      router.back();
    } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const handleLeave = () => Alert.alert('Gruptan Ayrıl', 'Ayrılmak istiyor musun?', [
    { text: 'İptal', style: 'cancel' },
    { text: 'Ayrıl', style: 'destructive', onPress: async () => {
      try { await groupsApi.leave(id); router.back(); }
      catch (err: any) { Alert.alert('Hata', err.response?.data?.message); }
    }},
  ]);

  const handleClose = () => Alert.alert('Grubu Kapat', 'Kapatmak istiyor musun?', [
    { text: 'İptal', style: 'cancel' },
    { text: 'Kapat', style: 'destructive', onPress: async () => {
      try { await groupsApi.close(id); router.back(); }
      catch (err: any) { Alert.alert('Hata', err.response?.data?.message); }
    }},
  ]);

  if (loading || !group) return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const isMember = group.members.some((m) => m.userId === user?.id);
  const isCreator = group.creatorId === user?.id;
  const maleCount = group.members.filter((m) => m.user?.gender === 'male').length;
  const femaleCount = group.members.filter((m) => m.user?.gender === 'female').length;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.backText}>←</Text></TouchableOpacity>
          <Text style={s.headerTitle}>Grup Detayı</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Event strip */}
        <TouchableOpacity style={s.eventStrip} onPress={() => router.push({ pathname: '/event/[id]', params: { id: group.event?.id } })}>
          <View>
            <Text style={s.eventName}>{group.event?.title}</Text>
            <Text style={s.venueName}>📍 {group.event?.venue?.name} · {group.event?.venue?.district}</Text>
          </View>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>

        {/* Offer */}
        <View style={[s.offerBanner, { backgroundColor: (OFFER_COLORS[group.offerType] || Colors.textMuted) + '22' }]}>
          <Text style={[s.offerText, { color: OFFER_COLORS[group.offerType] || Colors.textMuted }]}>
            {OFFER_LABELS[group.offerType]}
          </Text>
          {group.customNote && <Text style={s.customNote}>"{group.customNote}"</Text>}
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { val: `${group.members.length}/${group.maxMembers}`, lbl: 'Toplam' },
            { val: `👨 ${maleCount}`, lbl: 'Erkek' },
            { val: `👩 ${femaleCount}`, lbl: 'Kadın' },
            { val: group.status === 'open' ? '✓' : '✗', lbl: group.status === 'open' ? 'Açık' : 'Kapalı', color: group.status === 'open' ? Colors.success : Colors.error },
          ].map((item, i) => (
            <View key={i} style={[s.statBox, item.color && { borderWidth: 1, borderColor: item.color }]}>
              <Text style={[s.statValue, item.color && { color: item.color }]}>{item.val}</Text>
              <Text style={s.statLabel}>{item.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Members */}
        <Text style={s.sectionTitle}>Üyeler</Text>
        {group.members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={s.memberRow}
            onPress={() => router.push({ pathname: '/profile/[id]', params: { id: member.userId } })}
          >
            <View style={s.memberAvatar}>
              <Text style={s.memberAvatarText}>{member.user?.name?.[0]?.toUpperCase()}</Text>
            </View>
            <View style={s.memberInfo}>
              <View style={s.memberNameRow}>
                <Text style={s.memberName}>{member.user?.name}</Text>
                {member.role === 'creator' && (
                  <View style={s.creatorBadge}><Text style={s.creatorBadgeText}>Kurucu</Text></View>
                )}
                <Text style={{ fontSize: 16 }}>{GENDER_EMOJI[member.user?.gender] || '🧑'}</Text>
              </View>
              <Text style={s.memberScore}>⭐ {member.user?.trustScore?.toFixed(1) || '—'} · {member.user?.totalMeetups || 0} buluşma</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Actions */}
      {isMember && (
        <View style={s.bottom}>
          {group.status === 'closed' ? (
            <TouchableOpacity style={s.reviewBtn} onPress={() => router.push({ pathname: '/group/review', params: { groupId: id } })}>
              <Text style={s.reviewBtnText}>Üyeleri Puanla ⭐</Text>
            </TouchableOpacity>
          ) : isCreator ? (
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Text style={s.closeBtnText}>Grubu Kapat</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.leaveBtn} onPress={handleLeave}>
              <Text style={s.leaveBtnText}>Gruptan Ayrıl</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 48, marginBottom: Spacing.lg },
  backText: { color: Colors.primary, fontSize: 24, width: 40 },
  headerTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  eventStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  eventName: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.base },
  venueName: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 2 },
  arrow: { color: Colors.textMuted, fontSize: 22 },
  offerBanner: { borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  offerText: { fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold },
  customNote: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginTop: Spacing.xs, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statBox: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.base },
  statLabel: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  sectionTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, marginBottom: Spacing.md },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.base },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  memberName: { color: Colors.text, fontWeight: Fonts.weights.semibold },
  creatorBadge: { backgroundColor: Colors.accent + '33', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  creatorBadgeText: { color: Colors.accent, fontSize: 9, fontWeight: Fonts.weights.bold },
  memberScore: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.base, paddingBottom: 32, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  leaveBtn: { backgroundColor: Colors.error + '33', borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center', borderWidth: 1, borderColor: Colors.error },
  leaveBtnText: { color: Colors.error, fontWeight: Fonts.weights.bold },
  closeBtn: { backgroundColor: Colors.warning + '33', borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center', borderWidth: 1, borderColor: Colors.warning },
  closeBtnText: { color: Colors.warning, fontWeight: Fonts.weights.bold },
  reviewBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center' },
  reviewBtnText: { color: Colors.text, fontWeight: Fonts.weights.bold },
});
