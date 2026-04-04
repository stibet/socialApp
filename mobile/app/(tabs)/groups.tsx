import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { groupsApi } from '../../src/services/api';
import { Group, OFFER_LABELS, OFFER_COLORS } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const res = await groupsApi.getMyGroups(); setGroups(res.data); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.title}>Gruplarım</Text></View>
      <FlatList
        data={groups}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>👥</Text>
            <Text style={s.emptyText}>Henüz bir grubun yok</Text>
            <Text style={s.emptySubtext}>Etkinlikler sekmesinden grup oluştur veya katıl</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusColor = item.status === 'open' ? Colors.success : item.status === 'full' ? Colors.warning : Colors.error;
          const statusLabel = item.status === 'open' ? 'Açık' : item.status === 'full' ? 'Dolu' : 'Kapalı';
          const d = new Date(item.event?.eventDate);
          const dateStr = `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

          return (
            <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: '/group/[id]', params: { id: item.id } })} activeOpacity={0.8}>
              <View style={s.cardTop}>
                <Text style={s.eventName} numberOfLines={1}>{item.event?.title}</Text>
                <View style={[s.statusBadge, { backgroundColor: statusColor + '33', borderColor: statusColor }]}>
                  <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              </View>
              <Text style={s.venueName}>📍 {item.event?.venue?.name}</Text>
              <Text style={s.dateText}>🕐 {dateStr}</Text>
              <View style={s.cardFooter}>
                <View style={[s.offerChip, { backgroundColor: (OFFER_COLORS[item.offerType] || Colors.textMuted) + '33' }]}>
                  <Text style={[s.offerChipText, { color: OFFER_COLORS[item.offerType] || Colors.textMuted }]}>{OFFER_LABELS[item.offerType]}</Text>
                </View>
                <Text style={s.membersText}>👥 {item.members?.length}/{item.maxMembers}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { paddingTop: 56, padding: Spacing.xl, paddingBottom: Spacing.base },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold },
  list: { padding: Spacing.base, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  eventName: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.base, flex: 1, marginRight: Spacing.sm },
  statusBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusText: { fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.bold },
  venueName: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginBottom: 2 },
  dateText: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginBottom: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerChip: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  offerChipText: { fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.bold },
  membersText: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, marginTop: Spacing.md },
  emptySubtext: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
