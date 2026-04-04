import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../src/store';
import { usersApi } from '../../src/services/api';
import { Colors, Fonts, Spacing, Radius } from '../../src/types/theme';

const GENDER_LABEL: Record<string, string> = { male: '👨 Erkek', female: '👩 Kadın', other: '🧑 Diğer' };

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useStore();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateMe({ name, bio });
      await refreshUser();
      setEditing(false);
    } catch { Alert.alert('Hata', 'Profil güncellenemedi'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => Alert.alert('Çıkış Yap', 'Emin misin?', [
    { text: 'İptal', style: 'cancel' },
    { text: 'Çıkış Yap', style: 'destructive', onPress: async () => {
      await logout();
      router.replace('/auth/phone');
    }},
  ]);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.scroll}>
      <View style={s.header}>
        <Text style={s.title}>Profilim</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={s.logoutText}>Çıkış</Text></TouchableOpacity>
      </View>

      <View style={s.profileTop}>
        <View style={s.avatarBig}>
          <Text style={s.avatarBigText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{user?.trustScore?.toFixed(1) || '—'}</Text>
            <Text style={s.statLabel}>Güven Puanı</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statValue}>{user?.totalMeetups || 0}</Text>
            <Text style={s.statLabel}>Buluşma</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={s.statValue}>{[1,2,3,4,5].map((s) => s <= Math.round(user?.trustScore || 0) ? '⭐' : '').join('') || '—'}</Text>
            <Text style={s.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      <View style={s.card}>
        {editing ? (
          <>
            <Text style={s.fieldLabel}>İsim</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} autoCapitalize="words" maxLength={40} />
            <Text style={s.fieldLabel}>Biyografi</Text>
            <TextInput style={[s.input, s.bioInput]} value={bio} onChangeText={setBio} multiline maxLength={500} placeholder="Kendinden bahset..." placeholderTextColor={Colors.textMuted} />
            <View style={s.editActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setEditing(false); setName(user?.name || ''); setBio(user?.bio || ''); }}>
                <Text style={s.cancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
                <Text style={s.saveText}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={s.infoRow}><Text style={s.infoLabel}>İsim</Text><Text style={s.infoValue}>{user?.name}</Text></View>
            <View style={s.infoRow}><Text style={s.infoLabel}>Telefon</Text><Text style={s.infoValue}>{user?.phone}</Text></View>
            <View style={s.infoRow}><Text style={s.infoLabel}>Cinsiyet</Text><Text style={s.infoValue}>{GENDER_LABEL[user?.gender || ''] || '—'}</Text></View>
            {user?.bio ? <View style={s.infoRow}><Text style={s.infoLabel}>Hakkımda</Text><Text style={[s.infoValue, { maxWidth: '60%' }]}>{user.bio}</Text></View> : null}
            <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
              <Text style={s.editBtnText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, marginBottom: Spacing.xl },
  title: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold },
  logoutText: { color: Colors.error, fontSize: Fonts.sizes.sm },
  profileTop: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarBig: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg, borderWidth: 3, borderColor: Colors.primaryLight },
  avatarBigText: { color: Colors.text, fontSize: Fonts.sizes.xxl, fontWeight: Fonts.weights.bold },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, width: '100%' },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { color: Colors.text, fontWeight: Fonts.weights.bold, fontSize: Fonts.sizes.lg, marginBottom: 2 },
  statLabel: { color: Colors.textMuted, fontSize: Fonts.sizes.xs },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { color: Colors.textMuted, fontSize: Fonts.sizes.sm },
  infoValue: { color: Colors.text, fontSize: Fonts.sizes.sm, fontWeight: Fonts.weights.medium, textAlign: 'right' },
  editBtn: { marginTop: Spacing.lg, backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  editBtnText: { color: Colors.text, fontWeight: Fonts.weights.semibold },
  fieldLabel: { color: Colors.textSecondary, fontSize: Fonts.sizes.sm, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text, padding: Spacing.sm, fontSize: Fonts.sizes.base },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  cancelBtn: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.textSecondary, fontWeight: Fonts.weights.semibold },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: Colors.text, fontWeight: Fonts.weights.bold },
});