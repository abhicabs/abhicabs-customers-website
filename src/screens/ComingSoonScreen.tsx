import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Icon } from '../components/Icon';
import { colors, spacing, radius, family } from '../theme/theme';
import type { AppStackParamList } from '../navigation/types';

type R = RouteProp<AppStackParamList, 'ComingSoon'>;

export function ComingSoonScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<R>();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>
          {params.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.center}>
        <View style={styles.badge}>
          <Icon name="tool" size={30} color={colors.blue} />
        </View>
        <Text style={styles.title}>{params.title}</Text>
        <Text style={styles.sub}>{params.subtitle ?? 'This module is coming in an upcoming build.'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontFamily: family.bold, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xxl },
  badge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontFamily: family.bold, color: colors.text },
  sub: { fontSize: 14, fontFamily: family.medium, color: colors.muted, textAlign: 'center', lineHeight: 21 },
});
