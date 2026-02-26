import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { PaperBackground } from '@/src/components/ui/PaperBackground';
import { MaskingTapeHeader } from '@/src/components/ui/MaskingTapeHeader';
import { CraftButton } from '@/src/components/ui/CraftButton';
import { ScissorDivider } from '@/src/components/ui/ScissorDivider';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const [exporting, setExporting] = useState(false);

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

  const handleExportData = async () => {
    setExporting(true);
    try {
      const [children, entries, milestones, xpEvents, childLevels, achievements, reports] =
        await Promise.all([
          supabase.from('ll_children').select('*'),
          supabase.from('ll_entries').select('*'),
          supabase.from('ll_milestones').select('*'),
          supabase.from('ll_xp_events').select('*'),
          supabase.from('ll_child_levels').select('*'),
          supabase.from('ll_achievements').select('*'),
          supabase.from('ll_reports').select('*'),
        ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        children: children.data ?? [],
        entries: entries.data ?? [],
        milestones: milestones.data ?? [],
        xp_events: xpEvents.data ?? [],
        child_levels: childLevels.data ?? [],
        achievements: achievements.data ?? [],
        reports: reports.data ?? [],
      };

      const fileUri = `${FileSystem.cacheDirectory}lillearner-export.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));
      await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and ALL data for all children. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Type DELETE to confirm (tap Delete to proceed).',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Delete all user data (RLS ensures only own data)
                      await supabase.from('ll_reports').delete().eq('child_id', '').neq('id', '');
                      await supabase.from('ll_achievements').delete().neq('id', '');
                      await supabase.from('ll_xp_events').delete().neq('id', '');
                      await supabase.from('ll_child_levels').delete().neq('id', '');
                      await supabase.from('ll_milestones').delete().neq('id', '');
                      await supabase.from('ll_entries').delete().neq('id', '');
                      await supabase.from('ll_children').delete().neq('id', '');
                      await supabase.from('ll_profiles').delete().neq('id', '');
                      await signOut();
                    } catch {
                      Alert.alert('Error', 'Could not delete account. Please try again.');
                    }
                  },
                },
              ]
            );
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

        {/* Data Management */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Data</Text>

          <CraftButton
            title={exporting ? 'Exporting...' : 'Export All Data (JSON)'}
            onPress={handleExportData}
            color={colors.craftBlue}
            size="medium"
            style={styles.dataButton}
            disabled={exporting}
          />

          {exporting && (
            <ActivityIndicator
              size="small"
              color={colors.craftBlue}
              style={{ marginTop: spacing.sm }}
            />
          )}

          <CraftButton
            title="Delete Account"
            onPress={handleDeleteAccount}
            color={colors.craftRed}
            size="medium"
            style={styles.dataButton}
          />

          <Text style={styles.warningText}>
            Deleting your account removes all data permanently.
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
  dataButton: {
    marginTop: spacing.sm,
  },
  warningText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.craftRed,
    textAlign: 'center',
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  bottomPad: {
    height: spacing.xxl * 2,
  },
});
