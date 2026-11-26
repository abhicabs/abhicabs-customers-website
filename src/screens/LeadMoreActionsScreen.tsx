import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon, type IconName } from '../components/Icon';
import { colors, spacing, radius, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<AppStackParamList>;
type R = RouteProp<AppStackParamList, 'LeadMoreActions'>;

export function LeadMoreActionsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<R>();
  const close = () => navigation.goBack();
  const soon = (title: string) => {
    close();
    setTimeout(() => navigation.navigate('ComingSoon', { title }), 50);
  };

  const actions: { icon: IconName; label: string; danger?: boolean; onPress: () => void }[] = [
    { icon: 'refresh-cw', label: 'Change status', onPress: () => {
      close();
      setTimeout(() => navigation.navigate('LeadStatus', { id: params.id, current: params.current, allowedMoves: params.allowedMoves, version: params.version }), 50);
    } },
    { icon: 'edit-3', label: 'Log contact', onPress: () => navigate('LogContact', { id: params.id, name: params.name }) },
    { icon: 'user-check', label: 'Convert to policy holder', onPress: () => { close(); setTimeout(() => navigation.navigate('ConvertLead', { id: params.id }), 50); } },
    { icon: 'calendar', label: 'Add follow-up task', onPress: () => { close(); setTimeout(() => navigation.navigate('AddTask', { linkedType: 'LEAD', linkedId: params.id }), 50); } },
    { icon: 'edit', label: 'Edit lead', onPress: () => { close(); setTimeout(() => navigation.navigate('EditLead', { id: params.id }), 50); } },
    { icon: 'x-circle', label: 'Mark as lost', danger: true, onPress: () => { close(); setTimeout(() => navigation.navigate('MarkLost', { id: params.id, version: params.version }), 50); } },
  ];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Lead actions</Text>
        {actions.map((a) => (
          <Pressable key={a.label} style={styles.row} onPress={a.onPress}>
            <View style={[styles.icon, a.danger && { backgroundColor: colors.redSoft }]}>
              <Icon name={a.icon} size={18} color={a.danger ? colors.red : colors.text} />
            </View>
            <Text style={[styles.label, a.danger && { color: colors.red }]}>{a.label}</Text>
            <Icon name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, padding: spacing.xl, gap: spacing.sm },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
  title: { fontSize: 18, fontFamily: family.bold, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 15, fontFamily: family.semibold, color: colors.text },
});
