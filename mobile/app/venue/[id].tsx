import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { venuesApi, eventsApi } from '../../src/services/api';
import { Venue, Event } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

const venueEmoji = (tags: string[]) => {
  if (tags?.includes('bar')) return '🍺';
  if (tags?.includes('kulüp')) return '🎧';
  if (tags?.includes('meyhane')) return '🥃';
  if (tags?.includes('kafé')) return '☕';
  return '🏠';
};

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    Promise.all([venuesApi.getOne(id), eventsApi.getUpcoming(id)])
      .then(([vRes, eRes]) => { setVenue(vRes.data); setEvents(eRes.data); })
      .finally(() => setLoading(false));
  }, [id]));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    return { day: d.getDate(), month: months[d.getMonth()], time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` };
  };

  if (loading || !venue) return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.backText}>←</Text></TouchableOpacity>
        </View>

        <View style={s.heroSection}>
          <View style={s.venueIconBig}>
            <Text style={{ fontSize: 48 }}>{venueEmoji(venue.tags)}</Text>
          </View>
          <Text style={s.venueName}>{venue.name}</Text>
          <Text style={s.venueAddress}>📍 {venue.address}</Text>

          {venue.hasDamsizPolicy && (
            <View style={s.warningBanner}>
              <Text style={s.warningTitle}>⚠️ Damsız Politikası Var</Text>
              <Text style={s.warningText}>Bu mekan tek erkek veya erkek ağırlıklı grupları kabul etmeyebilir. Karma grup oluşturmanız önerilir.</Text>
            </View>
          )}

          <View style={s.tagsRow}>
            {venue.tags?.map((tag) => (
              <View key={tag} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
            ))}
          </View>

          {venue.instagram && <Text style={s.instagramLink}>📸 @{venue.instagram}</Text>}
        </View>

        <Text style={s.sectionTitle}>Yaklaşan Etkinlikler</Text>

        {events.length === 0 ? (
          <View style={s.noEvents}><Text style={s.noEventsText}>Yaklaşan etkinlik yok</Text></View>
        ) : (
          events.map((event) => {
            const { day, month, time } = formatDate(event.eventDate);
            return (
              <TouchableOpacity
                key={event.id}
                style={s.eventCard}
                onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
              >
                <View style={s.eventDateBadge}>
                  <Text style={s.eventDateDay}>{day}</Text>
                  <Text style={s.eventDateMonth}>{month}</Text>
                </View>
                <View style={s.eventInfo}>
                  <Text style={s.eventTitle}>{event.title}</Text>
                  <Text style={s.eventTime}>🕐 {time}</Text>
                </View>
                <Text style={s.arrow}>›</Text>
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
  scroll: { padding: Spacing.base, paddingBottom: 60 },
  header: { paddingTop: 48, marginBottom: Spacing.base },
  backText: { color: Colors.primary, fontSize: 24, width: 40 },
  heroSection: { alignItems: 'center', marginBottom: Spacing.xl },
  venueIconBig: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border, marginBottom: Spacing.md },
  venueName: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, marginBottom: Spacing.xs, textAlign: 'center' },
  venueAddress: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginBottom: Spacing.md, textAlign: 'center' },
  warningBanner: { backgroundColor: Colors.warning + '22', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, width: '100%', borderWidth: 1, borderColor: Colors.warning + '44' },
  warningTitle: { color: Colors.warning, fontWeight: Fonts.weights.bold, marginBottom: 4 },
  warningText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: Spacing.sm },
  tag: { backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border },
  tagText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm },
  instagramLink: { color: Colors.info, fontSize: Fonts.sizes.sm, marginTop: Spacing.sm },
  sectionTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, marginBottom: Spacing.md },
  noEvents: { alignItems: 'center', paddingVertical: 32 },
  noEventsText: { color: Colors.textMuted, fontSize: Fonts.sizes.base },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  eventDateBadge: { backgroundColor: Colors.primary, borderRadius: Radius.sm, width: 44, alignItems: 'center', paddingVertical: Spacing.sm },
  eventDateDay: { color: Colors.text, fontWeight: Fonts.weights.extrabold, fontSize: Fonts.sizes.lg },
  eventDateMonth: { color: Colors.text + 'CC', fontSize: 9, fontWeight: Fonts.weights.bold },
  eventInfo: { flex: 1 },
  eventTitle: { color: Colors.text, fontWeight: Fonts.weights.bold },
  eventTime: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  arrow: { color: Colors.textMuted, fontSize: 22 },
});
