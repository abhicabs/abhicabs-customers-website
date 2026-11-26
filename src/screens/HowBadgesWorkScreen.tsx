import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { colors, family } from '../theme/theme';

const SECTIONS: { label: string; text?: string; pills?: string[] }[] = [
  { label: 'CHANNEL · SET ONCE', text: 'Meta Ads, Google Ads or Website: the connection the lead came through.' },
  { label: 'CAMPAIGN STATUS · SYNCED EVERY 15 MIN', pills: ['Active', 'In review', 'Paused', 'Not approved', 'Ended'] },
  { label: 'WEBSITE FORM', pills: ['Active', 'Turned off'] },
  { label: 'CONNECTION', pills: ['Connected', 'Syncing', 'Sync failed', 'Reconnect needed', 'Disconnected'] },
];

export function HowBadgesWorkScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const close = () => navigation.goBack();

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.handleRow}><View style={styles.handle} /></View>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>How campaign badges work</Text>
            <Text style={styles.sub}>Where each badge comes from</Text>
          </View>
          <Pressable style={styles.close} hitSlop={8} onPress={close}><Icon name="x" size={14} color={colors.text} /></Pressable>
        </View>

        <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {SECTIONS.map((s) => (
            <View key={s.label} style={{ gap: 8 }}>
              <Text style={styles.sectionLabel}>{s.label}</Text>
              {s.text ? <Text style={styles.text}>{s.text}</Text> : null}
              {s.pills ? (
                <View style={styles.pills}>
                  {s.pills.map((p) => <View key={p} style={styles.pill}><Text style={styles.pillText}>{p}</Text></View>)}
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
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
  sectionLabel: { fontSize: 10, fontFamily: family.bold, color: colors.muted, letterSpacing: 0.6 },
  text: { fontSize: 13, lineHeight: 20, fontFamily: family.medium, color: colors.muted },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  pillText: { fontSize: 12, fontFamily: family.semibold, color: colors.muted2 },
});
