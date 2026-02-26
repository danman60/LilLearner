import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { PaperBackground } from '@/src/components/ui/PaperBackground';
import { MaskingTapeHeader } from '@/src/components/ui/MaskingTapeHeader';
import { CraftButton } from '@/src/components/ui/CraftButton';
import { ScissorDivider } from '@/src/components/ui/ScissorDivider';
import { useAuthStore } from '@/src/stores/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <PaperBackground scroll>
      <View style={styles.content}>
        <MaskingTapeHeader title="Settings" />

        {/* About section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App</Text>
            <Text style={styles.infoValue}>LilLearner</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Built with</Text>
            <Text style={styles.infoValue}>Expo + React Native</Text>
          </View>

          <Text style={styles.description}>
            A scrapbook-style child development tracker to celebrate every little milestone.
          </Text>
        </View>

        <ScissorDivider style={styles.divider} />

        {/* Sign out */}
        <View style={styles.signOutSection}>
          <CraftButton
            title="Sign Out"
            onPress={handleSignOut}
            color={colors.craftRed}
            size="large"
            style={styles.signOutButton}
          />
        </View>

        <View style={styles.bottomPad} />
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xxl + spacing.md,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginTop: spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.pencilGray,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(173, 206, 240, 0.3)',
  },
  infoLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#8B7E6A',
  },
  infoValue: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.pencilGray,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8B7E6A',
    marginTop: spacing.md,
    lineHeight: 20,
    textAlign: 'center',
  },
  divider: {
    marginVertical: spacing.lg,
  },
  signOutSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  signOutButton: {
    minWidth: 200,
  },
  bottomPad: {
    height: spacing.xxl * 2,
  },
});
