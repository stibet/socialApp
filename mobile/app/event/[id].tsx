import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { eventsApi, groupsApi } from '../../src/services/api';
import { Event, Group, OFFER_LABELS, OFFER_COLORS } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';
import { useStore } from '../../src/store';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  const load = async () => {
    try {
      const [eRes, gRes] = await Promise.all([
        eventsApi.getOne(id),
        groupsApi.getByEvent(id),
      ]);
      setEvent(eRes.data);
      setGroups(gRes.data);
    } catch {
      Alert.alert('Hata', 'Etkinlik yüklenemedi');
      router.back();
    } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const handleJoin = async (groupId: string) => {
    try {
      await groupsApi.join(groupId);
      Alert.alert('Katıldın! 🎉', 'Gruba başarıyla katıldın');
      load();
    } catch (err: any) {
      Alert.alert('Hata', err.response?.data?.message || 'Katılamadın');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const myGroup = groups.find((g) => g.members.some((m) => m.userId === user?.id));

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Event Info */}
        <View style={s.eventCard}>
          <Text style={s.eventTitle}>{event?.title}</Text>
          {event?.description && <Text style={s.eventDesc}>{event.description}</Text>}
          <Text style={s.metaItem}>📍 {event?.venue?.name} · {event?.venue?.district}</Text>
          <Text style={s.metaItem}>🕐 {event?.eventDate && formatDate(event.eventDate)}</Text>
          {event?.venue?.hasDamsizPolicy && (
            <View style={s.warningBox}>
              <Text style={s.warningText}>⚠️ Bu mekan damsız erkek kabul etmiyor. Karma grup oluşturmanız gerekiyor.</Text>
            </View>
          )}
        </View>

        {/* Groups Header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Açık Gruplar ({groups.length})</Text>
          {!myGroup && (
            <TouchableOpacity
              style={s.createBtn}
              onPress={() => router.push({ pathname: '/group/create', params: { eventId: id } })}
            >
              <Text style={s.createBtnText}>+ Grup Oluştur</Text>
            </TouchableOpacity>
          )}
        </View>

        {groups.length === 0 ? (
          <View style={s.noGroups}>
            <Text style={{ fontSize: 48 }}>👥</Text>
            <Text style={s.noGroupsText}>Henüz grup yok</Text>
            <Text style={s.noGroupsSubtext}>İlk grubu sen oluştur!</Text>
          </View>
        ) : (
          groups.map((group) => {
            const isMember = group.members.some((m) => m.userId === user?.id);
            const maleCount = group.members.filter((m) => m.user?.gender === 'male').length;
            const femaleCount = group.members.filter((m) => m.user?.gender === 'female').length;
            const isFull = group.members.length >= group.maxMembers;

            return (
              <TouchableOpacity
                key={group.id}
                style={s.groupCard}
                onPress={() => router.push({ pathname: '/group/[id]', params: { id: group.id } })}
                activeOpacity={0.8}
              >
                <View style={s.groupTop}>
                  <View style={s.creatorRow}>
                    <View style={s.avatar}>
                      <Text style={s.avatarText}>{group.creator?.name?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={s.creatorName}>{group.creator?.name}</Text>
                      <Text style={s.creatorScore}>⭐ {group.creator?.trustScore?.toFixed(1) || '—'}</Text>
                    </View>
                  </View>
                  <View style={[s.offerTag, { backgroundColor: (OFFER_COLORS[group.offerType] || Colors.textMuted) + '33' }]}>
                    <Text style={[s.offerText, { color: OFFER_COLORS[group.offerType] || Colors.textMuted }]}>
                      {OFFER_LABELS[group.offerType]}
                    </Text>
                  </View>
                </View>

                {group.customNote ? <Text style={s.note}>"{group.customNote}"</Text> : null}

                <View style={s.groupFooter}>
                  <Text style={s.memberCount}>👥 {group.members.length}/{group.maxMembers}{'  '}👨 {maleCount} · 👩 {femaleCount}</Text>
                  {isMember ? (
                    <View style={s.joinedBadge}><Text style={s.joinedText}>✓ Katıldın</Text></View>
                  ) : isFull ? (
                    <View style={s.fullBadge}><Text style={s.fullText}>Dolu</Text></View>
                  ) : (
                    <TouchableOpacity style={s.joinBtn} onPress={() => handleJoin(group.id)}>
                      <Text style={s.joinBtnText}>Katıl</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 100 },
  header: { paddingTop: 48, marginBottom: Spacing.base },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { color: Colors.primary, fontSize: 24 },
  eventCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  eventTitle: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, marginBottom: Spacing.sm },
  eventDesc: { color: Colors.textSecondary, fontSize: Fonts.sizes.base, marginBottom: Spacing.md, lineHeight: 22 },
  metaItem: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginBottom: 4 },
  warningBox: { backgroundColor: Colors.warning + '22', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '44' },
  warningText: { color: Colors.warning, fontSize: Fonts.sizes.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold },
  createBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  createBtnText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold },
  noGroups: { alignItems: 'center', paddingVertical: 40 },
  noGroupsText: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, marginTop: Spacing.md },
  noGroupsSubtext: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: Spacing.sm },
  groupCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  groupTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.text, fontWeight: Fonts.weights.bold },
  creatorName: { color: Colors.text, fontWeight: Fonts.weights.semibold, fontSize: Fonts.sizes.sm },
  creatorScore: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  offerTag: { borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  offerText: { fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.bold },
  note: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontStyle: 'italic', marginBottom: Spacing.sm },
  groupFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm },
  memberCount: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  joinBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  joinBtnText: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold },
  joinedBadge: { backgroundColor: Colors.success + '33', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  joinedText: { color: Colors.success, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold },
  fullBadge: { backgroundColor: Colors.error + '33', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  fullText: { color: Colors.error, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.bold },
});
