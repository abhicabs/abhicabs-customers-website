import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { OtpInput } from '../components/OtpInput';
import { Icon } from '../components/Icon';
import { api } from '../api/endpoints';
import { ApiError, newIdempotencyKey } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing, family } from '../theme/theme';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginOtp'>;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// M02 · Login — Enter the code
export function LoginOtpScreen({ route, navigation }: Props) {
  const { mobile, maskedMobile, codeLength, resendAfterSeconds, register } = route.params;
  const { completeSignIn } = useAuth();

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(resendAfterSeconds);
  const idemKey = useRef(newIdempotencyKey());

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const verify = useCallback(
    async (full: string) => {
      if (full.length !== codeLength || verifying) return;
      setVerifying(true);
      setError(null);
      try {
        const { data } = await (register ? api.auth.registerVerify : api.auth.loginVerify)({ mobile, code: full }, { idempotencyKey: idemKey.current });
        await completeSignIn(data);
      } catch (e) {
        idemKey.current = newIdempotencyKey();
        setCode('');
        if (e instanceof ApiError) {
          const left = e.details?.triesLeft;
          setError(e.fieldErrors.code || (typeof left === 'number' ? `Incorrect OTP. ${left} tries left.` : e.message));
        } else {
          setError('Could not verify the code. Please try again.');
        }
      } finally {
        setVerifying(false);
      }
    },
    [codeLength, verifying, mobile, completeSignIn],
  );

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const { data } = await (register ? api.auth.registerOtp({ name: '', mobile, termsAccepted: true } as any) : api.auth.loginOtp({ mobile }));
      setCooldown(data.resendAfterSeconds || resendAfterSeconds);
      setCode('');
      idemKey.current = newIdempotencyKey();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.is('OTP_SEND_LIMIT')) setCooldown(60);
      } else {
        setError('Could not resend the code. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  const target = maskedMobile || mobile;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.back}>
            <Icon name="chevron-left" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>Enter the code</Text>
          <View style={styles.sentRow}>
            <Text style={styles.sent}>Sent to {target} · </Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={6}>
              <Text style={styles.change}>Change</Text>
            </Pressable>
          </View>

          <OtpInput
            length={codeLength}
            value={code}
            onChange={(c) => {
              setCode(c);
              if (error) setError(null);
            }}
            onComplete={verify}
            error={!!error}
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.resendRow}>
            <Icon name="clock" size={15} color={colors.muted} />
            {cooldown > 0 ? (
              <Text style={styles.resendMuted}>Resend code in {mmss(cooldown)}</Text>
            ) : (
              <Pressable onPress={resend} disabled={resending} hitSlop={8}>
                <Text style={styles.resendLink}>{resending ? 'Sending…' : 'Resend code'}</Text>
              </Pressable>
            )}
          </View>

          <Button label="Verify" icon="check" onPress={() => verify(code)} loading={verifying} disabled={code.length !== codeLength} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.xxl, paddingTop: spacing.xl, gap: spacing.xl },
  back: { width: 32, height: 32, justifyContent: 'center' },
  title: { fontSize: 30, fontFamily: family.bold, color: colors.text, letterSpacing: -0.6 },
  sentRow: { flexDirection: 'row', alignItems: 'center', marginTop: -spacing.md },
  sent: { fontSize: 14, fontFamily: family.medium, color: colors.muted },
  change: { fontSize: 14, fontFamily: family.bold, color: colors.blue },
  errorText: { color: colors.red, fontSize: 13, fontFamily: family.medium, marginTop: -spacing.sm },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  resendMuted: { color: colors.muted, fontSize: 13, fontFamily: family.medium },
  resendLink: { color: colors.blue, fontSize: 13, fontFamily: family.bold },
});
