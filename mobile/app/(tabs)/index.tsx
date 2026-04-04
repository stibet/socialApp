import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { eventsApi } from '../../src/services/api';
import { Event } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';
import { useStore } from '../../src/store';

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useStore();

  const load = async () => {
    try {
      const res = await eventsApi.getUpcoming();
      setEvents(res.data);
    } catch {} finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return { day: d.getDate(), month: months[d.getMonth()], time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`, weekday: days[d.getDay()] };
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Merhaba {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={s.title}>Bu Gece Ne Var?</Text>
        </View>
        <Text style={{ fontSize: 32 }}>🎉</Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>🎭</Text>
            <Text style={s.emptyText}>Yakında etkinlik yok</Text>
            <Text style={s.emptySubtext}>Yeni etkinlikler eklenince burada görünecek</Text>
          </View>
        }
        renderItem={({ item }) => {
          const { day, month, time } = formatDate(item.eventDate);
          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })}
              activeOpacity={0.8}
            >
              <View style={s.dateStrip}>
                <Text style={s.dateDay}>{day}</Text>
                <Text style={s.dateMonth}>{month}</Text>
              </View>
              <View style={s.cardBody}>
                <Text style={s.eventTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.venueName}>{item.venue?.name}</Text>
                <Text style={s.venueDistrict}>📍 {item.venue?.district}</Text>
                <View style={s.meta}>
                  <Text style={s.time}>🕐 {time}</Text>
                  {item.venue?.hasDamsizPolicy && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>Dam zorunlu</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={s.arrow}>›</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl, paddingTop: 56, paddingBottom: Spacing.base },
  greeting: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold },
  list: { padding: Spacing.base, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', alignItems: 'center' },
  dateStrip: { backgroundColor: Colors.primary, width: 56, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg },
  dateDay: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.extrabold },
  dateMonth: { color: Colors.text + 'CC', fontSize: Fonts.sizes.xs, fontWeight: Fonts.weights.bold },
  cardBody: { flex: 1, padding: Spacing.md },
  eventTitle: { color: Colors.text, fontSize: Fonts.sizes.base, fontWeight: Fonts.weights.bold, marginBottom: 2 },
  venueName: { color: Colors.primary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
  venueDistrict: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginBottom: Spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  time: { color: Colors.textSecondary, fontSize: Fonts.sizes.xs },
  badge: { backgroundColor: Colors.warning + '33', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: Colors.warning + '66' },
  badgeText: { color: Colors.warning, fontSize: 9, fontWeight: Fonts.weights.bold },
  arrow: { color: Colors.textMuted, fontSize: 24, paddingRight: Spacing.md },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, marginTop: Spacing.base },
  emptySubtext: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: Spacing.sm, textAlign: 'center' },
});
