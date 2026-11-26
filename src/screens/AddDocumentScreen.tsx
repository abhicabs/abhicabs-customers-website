import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { API_BASE, CLIENT_HEADER } from '../config/env';
import { tokenStore } from '../auth/tokenStore';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';
import type { CustomerDetail } from '../api/types';

type R = RouteProp<AppStackParamList, 'AddDocument'>;
const TYPES = ['Aadhaar', 'PAN', 'Passport', 'Driving licence', 'Medical report', 'Policy copy', 'Vehicle RC', 'Other'];
const AV = ['#fbd5dd', '#d9eafd', '#d4f1e7', '#fde8c9', '#e9e3fc'];
const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

export function AddDocumentScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [personKey, setPersonKey] = useState<string | null>(null);
  const [type, setType] = useState('Aadhaar');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => navigation.goBack();

  const load = useCallback(async () => {
    try { const { data } = await api.customers.get(params.customerId); setCustomer(data); setPersonKey(`C:${data.id}`); } catch { /* */ }
  }, [params.customerId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const people = customer
    ? [{ key: `C:${customer.id}`, name: customer.name }, ...(customer.family ?? []).map((m) => ({ key: `F:${m.id}`, name: m.name }))]
    : [];

  const upload = async () => {
    if (!personKey) { setError('Choose a person.'); return; }
    setError(null);
    let picked: DocumentPicker.DocumentPickerResult;
    try {
      picked = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    } catch { setError('Could not open the file picker.'); return; }
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    setBusy(true);
    try {
      const token = tokenStore.getAccess();
      const blob = await (await fetch(asset.uri)).blob();
      const up = await fetch(`${API_BASE}/files?purpose=CUSTOMER_DOCUMENT`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'X-Client': CLIENT_HEADER,
          'X-File-Name': encodeURIComponent(asset.name ?? 'document'),
          'Content-Type': asset.mimeType ?? 'application/octet-stream',
        },
        body: blob,
      });
      const j = await up.json().catch(() => ({} as any));
      if (!up.ok || !j?.data?.id) throw new ApiError({ status: up.status, ...(j?.error || { message: 'Upload failed' }) });
      await api.customers.addDocument(params.customerId, { personKey, type, fileId: j.data.id }, { idempotencyKey: newIdempotencyKey() });
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not upload the document.');
    } finally { setBusy(false); }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Add document</Text>
            <Text style={styles.sub}>Saved to one person only</Text>
          </View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        <Text style={styles.label}>Whose document?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.people}>
          {people.map((pp, i) => {
            const on = pp.key === personKey;
            return (
              <Pressable key={pp.key} style={styles.personCol} onPress={() => setPersonKey(pp.key)}>
                <View style={[styles.pAvatar, { backgroundColor: AV[i % AV.length] }, on && styles.pAvatarOn]}>
                  <Text style={styles.pAvatarText}>{initials(pp.name)}</Text>
                </View>
                <Text style={[styles.pName, on && { color: colors.text }]} numberOfLines={1}>{pp.name.split(' ')[0]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Which document?</Text>
        <View style={styles.chips}>
          {TYPES.map((t) => {
            const on = t === type;
            return (
              <Pressable key={t} style={[styles.chip, on ? styles.chipOn : styles.chipOff]} onPress={() => setType(t)}>
                <Text style={[styles.chipText, { color: on ? colors.onPrimary : colors.muted3 }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Pressable style={[styles.photo, shadow.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => navigation.navigate('UploadSource', { target: 'AddDocument' })}>
            <Icon name="camera" size={18} color={colors.onPrimary} />
            <Text style={styles.photoText}>Take photo</Text>
          </Pressable>
          <Pressable style={[styles.file, busy && { opacity: 0.6 }]} disabled={busy} onPress={upload}>
            <Icon name="folder" size={18} color={colors.text} />
            <Text style={styles.fileText}>{busy ? 'Uploading…' : 'Choose file'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 12 },
  handleRow: { alignItems: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 12, fontFamily: family.medium, color: colors.muted, marginTop: 2 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontFamily: family.semibold, color: colors.text },
  people: { gap: 14, paddingVertical: 4 },
  personCol: { alignItems: 'center', gap: 6, width: 56 },
  pAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  pAvatarOn: { borderColor: colors.blue },
  pAvatarText: { fontSize: 14, fontFamily: family.bold, color: colors.navy },
  pName: { fontSize: 11, fontFamily: family.semibold, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  chipOn: { backgroundColor: colors.navy },
  chipOff: { backgroundColor: colors.bg },
  chipText: { fontSize: 13, fontFamily: family.semibold },
  error: { fontSize: 13, fontFamily: family.medium, color: colors.red },
  actions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  photo: { flex: 1, height: 50, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoText: { fontSize: 14, fontFamily: family.semibold, color: colors.onPrimary },
  file: { flex: 1, height: 50, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  fileText: { fontSize: 14, fontFamily: family.semibold, color: colors.text },
});
