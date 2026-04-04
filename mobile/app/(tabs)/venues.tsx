import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { venuesApi } from '../../src/services/api';
import { Venue } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

const DISTRICTS = ['Tümü', 'Kızılay', 'Çankaya', 'Ulus', 'Bahçelievler'];

const venueEmoji = (tags: string[]) => {
  if (tags?.includes('bar')) return '🍺';
  if (tags?.includes('kulüp')) return '🎧';
  if (tags?.includes('meyhane')) return '🥃';
  if (tags?.includes('kafé')) return '☕';
  return '🏠';
};

export default function VenuesScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState('Tümü');

  const load = async (district?: string) => {
    try {
      const res = await venuesApi.getAll(district !== 'Tümü' ? district : undefined);
      setVenues(res.data);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(activeDistrict); }, [activeDistrict]));

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Mekanlar</Text>
        <Text style={s.subtitle}>Ankara'daki eğlence noktaları</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
        {DISTRICTS.map((d) => (
          <TouchableOpacity key={d} style={[s.chip, activeDistrict === d && s.chipActive]} onPress={() => setActiveDistrict(d)}>
            <Text style={[s.chipText, activeDistrict === d && s.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={venues}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(activeDistrict); }} tintColor={Colors.primary} />}
        ListEmptyComponent={<View style={s.empty}><Text style={{ fontSize: 48 }}>🏠</Text><Text style={s.emptyText}>Mekan bulunamadı</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => router.push({ pathname: '/venue/[id]', params: { id: item.id } })} activeOpacity={0.8}>
            <View style={s.icon}><Text style={{ fontSize: 28 }}>{venueEmoji(item.tags)}</Text></View>
            <View style={s.cardBody}>
              <Text style={s.venueName}>{item.name}</Text>
              <Text style={s.venueAddr} numberOfLines={1}>{item.address}</Text>
              <View style={s.tagsRow}>
                {item.tags?.slice(0, 3).map((tag) => (
                  <View key={tag} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
                ))}
              </View>
            </View>
            {item.hasDamsizPolicy && (
              <View style={s.damBadge}><Text>⚠️</Text></View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold },
  subtitle: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginTop: 2 },
  filterScroll: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm, maxHeight: 50 },
  chip: { backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium },
  chipTextActive: { color: Colors.text },
  list: { padding: Spacing.base, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: Spacing.md },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  venueName: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.base },
  venueAddr: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2, marginBottom: Spacing.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { color: Colors.textSecondary, fontSize: 10 },
  damBadge: { backgroundColor: Colors.warning + '22', borderRadius: Radius.sm, padding: 6, borderWidth: 1, borderColor: Colors.warning + '44' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: Fonts.sizes.base, marginTop: Spacing.md },
});
