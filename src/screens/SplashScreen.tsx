import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../components/Icon';
import { family } from '../theme/theme';

// M00 · Splash — exact: navy vertical gradient, translucent white badge, wordmark + tagline.
export function SplashScreen() {
  return (
    <LinearGradient colors={['#1a3460', '#0b1830']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.fill}>
      <StatusBar style="light" />
      <View style={styles.badge}>
        <Icon name="shield" size={48} color="#ffffff" />
      </View>
      <Text style={styles.word}>Bimayantra</Text>
      <Text style={styles.tagline}>Every policy. Every renewal.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  word: { marginTop: 20, fontSize: 28, lineHeight: 34, fontFamily: family.bold, color: '#ffffff', letterSpacing: -0.28 },
  tagline: { marginTop: 8, fontSize: 14, fontFamily: family.medium, color: '#c9d6ea' },
});
