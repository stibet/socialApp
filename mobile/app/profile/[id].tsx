import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { usersApi, reviewsApi } from '../../src/services/api';
import { Review } from '../../src/types';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

const GENDER_LABEL: Record<string, string> = { male: '👨 Erkek', female: '👩 Kadın', other: '🧑 Diğer' };

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    Promise.all([usersApi.getUser(id), reviewsApi.getByUser(id)])
      .then(([uRes, rRes]) => { setUser(uRes.data); setReviews(rRes.data); })
      .finally(() => setLoading(false));
  }, [id]));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  if (loading || !user) return <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.backText}>←</Text></TouchableOpacity>
        </View>

        <View style={s.profileSection}>
          <View style={s.avatar}><Text style={s.avatarText}>{user.name?.[0]?.toUpperCase()}</Text></View>
          <Text style={s.userName}>{user.name}</Text>
          <Text style={s.userGender}>{GENDER_LABEL[user.gender] || ''}</Text>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statValue}>{user.trustScore?.toFixed(1) || '—'}</Text>
              <Text style={s.statLabel}>Güven</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statValue}>{user.totalMeetups || 0}</Text>
              <Text style={s.statLabel}>Buluşma</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statBox}>
              <Text style={s.statValue}>{reviews.length}</Text>
              <Text style={s.statLabel}>Yorum</Text>
            </View>
          </View>

          {user.bio && (
            <View style={s.bioBox}><Text style={s.bioText}>"{user.bio}"</Text></View>
          )}
        </View>

        <Text style={s.sectionTitle}>Yorumlar ({reviews.length})</Text>

        {reviews.length === 0 ? (
          <Text style={s.noReviews}>Henüz yorum yok</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={s.reviewCard}>
              <View style={s.reviewTop}>
                <View style={s.reviewerAvatar}><Text style={s.reviewerAvatarText}>{review.reviewer?.name?.[0]?.toUpperCase()}</Text></View>
                <View style={s.reviewerInfo}>
                  <Text style={s.reviewerName}>{review.reviewer?.name}</Text>
                  <Text style={s.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
                <View style={s.starsRow}>
                  {[1,2,3,4,5].map((star) => (
                    <Text key={star} style={{ fontSize: 12 }}>{star <= review.rating ? '⭐' : '☆'}</Text>
                  ))}
                </View>
              </View>
              {review.comment && <Text style={s.reviewComment}>"{review.comment}"</Text>}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 60 },
  header: { paddingTop: 48, marginBottom: Spacing.md },
  backText: { color: Colors.primary, fontSize: 24, width: 40 },
  profileSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, borderWidth: 3, borderColor: Colors.primaryLight },
  avatarText: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold },
  userName: { color: Colors.text, fontSize: Fonts.sizes.xl, fontWeight: Fonts.weights.bold, marginBottom: 4 },
  userGender: { color: Colors.textMuted, fontSize: Fonts.sizes.sm, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, width: '100%', marginBottom: Spacing.md },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.lg },
  statLabel: { color: Colors.textMuted, fontSize: Fonts.sizes.xs, marginTop: 2 },
  bioBox: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, width: '100%', borderWidth: 1, borderColor: Colors.border },
  bioText: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontStyle: 'italic', lineHeight: 20 },
  sectionTitle: { color: Colors.text, fontSize: Fonts.sizes.lg, fontWeight: Fonts.weights.bold, marginBottom: Spacing.md },
  noReviews: { color: Colors.textMuted, textAlign: 'center', paddingVertical: 32 },
  reviewCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  reviewerAvatarText: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.sm },
  reviewerInfo: { flex: 1 },
  reviewerName: { color: Colors.text, fontWeight: Fonts.weights.semibold, fontSize: Fonts.sizes.sm },
  reviewDate: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  starsRow: { flexDirection: 'row' },
  reviewComment: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, fontStyle: 'italic' },
});
