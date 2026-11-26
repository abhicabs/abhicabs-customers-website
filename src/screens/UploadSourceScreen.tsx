import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon, type IconName } from '../components/Icon';
import { colors, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'UploadSource'>;

export function UploadSourceScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const close = () => navigation.goBack();
  // Return the chosen source to the opener via merge params; the opener runs the picker it supports.
  const pick = (source: 'CAMERA' | 'FILES' | 'PHOTOS') => {
    navigation.navigate({ name: params?.target ?? 'AddDocument', params: { uploadSource: source }, merge: true } as any);
  };
  const rows: { icon: IconName; bg: string; fg: string; label: string; s: 'CAMERA' | 'FILES' | 'PHOTOS' }[] = [
    { icon: 'camera', bg: '#e8f0fd', fg: colors.blue, label: 'Take photo', s: 'CAMERA' },
    { icon: 'folder', bg: '#e9e3fc', fg: '#5b3fb8', label: 'Choose from Files', s: 'FILES' },
    { icon: 'grid', bg: '#fde8c9', fg: '#8a5a12', label: 'Choose from Photos', s: 'PHOTOS' },
  ];
  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}><Text style={styles.title}>Add a file</Text><Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable></View>
        {rows.map((r) => (
          <Pressable key={r.s} style={styles.row} onPress={() => pick(r.s)}>
            <View style={[styles.rowIcon, { backgroundColor: r.bg }]}><Icon name={r.icon} size={18} color={r.fg} /></View>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Icon name="chevron-right" size={16} color={colors.grayBar} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,31,59,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18, gap: 2 },
  handleRow: { alignItems: 'center', paddingBottom: 6 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#d5dbe5' },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6 },
  title: { flex: 1, fontSize: 18, fontFamily: family.bold, color: colors.text },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: family.semibold, color: colors.text },
});
