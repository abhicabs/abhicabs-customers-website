import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { colors, family, shadow } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'AccountBlocked'>;

export function AccountBlockedScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  const closed = params?.variant === 'closed';
  const title = closed ? 'Your account is closed' : 'Your account is suspended';
  const message = params?.message
    ?? (closed
      ? 'This account has been closed. Your data has been archived. Contact SkyUp support if this is a mistake.'
      : 'SkyUp has suspended this account. Your data is safe. Contact SkyUp support to restore access.');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.appbar}><Text style={styles.navTitle}>Account</Text></View>
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: closed ? '#fbebec' : '#fde8c9' }]}>
            <Icon name={closed ? 'x-circle' : 'alert-triangle'} size={32} color={closed ? '#b4323c' : '#8a5a12'} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <Pressable style={[styles.cta, shadow.button]} onPress={() => Linking.openURL('https://wa.me/').catch(() => Linking.openURL('mailto:support@bimayantra.com?subject=Advisor%20app%20support').catch(() => undefined))}>
          <Icon name="message-circle" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaText}>Contact SkyUp support</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  appbar: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 10 },
  navTitle: { fontSize: 18, fontFamily: family.bold, color: colors.text },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 12, gap: 12, justifyContent: 'center', paddingBottom: 80 },
  card: { backgroundColor: colors.surface, borderRadius: 26, padding: 28, alignItems: 'center', gap: 12 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, lineHeight: 26, fontFamily: family.bold, color: colors.text, textAlign: 'center' },
  message: { fontSize: 13, lineHeight: 20, fontFamily: family.medium, color: colors.muted, textAlign: 'center' },
  cta: { height: 54, borderRadius: 24, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontSize: 15, fontFamily: family.semibold, color: colors.onPrimary },
});
