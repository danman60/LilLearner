import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { PaperBackground } from '@/src/components/ui/PaperBackground';
import { MaskingTapeHeader } from '@/src/components/ui/MaskingTapeHeader';
import { CraftButton } from '@/src/components/ui/CraftButton';
import { ScissorDivider } from '@/src/components/ui/ScissorDivider';
import { useAuthStore } from '@/src/stores/authStore';
import { supabase } from '@/src/lib/supabase';
import { Paths, File as ExpoFile } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useUserPreferences, useUpsertPreferences } from '@/src/hooks/useUserPreferences';

interface FeatureToggleProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  saving?: boolean;
}

function FeatureToggle({ label, description, value, onToggle, saving }: FeatureToggleProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: '#5B9BD5' }}
        thumbColor="#FFFFFF"
        disabled={saving}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const [exporting, setExporting] = useState(false);
  const { data: prefs } = useUserPreferences();
  const upsert = useUpsertPreferences();

  const handleToggle = (key: string) => {
    if (!prefs) return;
    const current = prefs[key as keyof typeof prefs] as boolean;
    upsert.mutate({ [key]: !current });
  };

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

      const file = new ExpoFile(Paths.cache, 'lillearner-export.json');
      file.write(JSON.stringify(exportData, null, 2));
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json' });
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

        {/* Features section */}
        {prefs && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Features</Text>
              <FeatureToggle
                label="XP & Levels"
                description="Earn XP, level up, unlock achievements"
                value={prefs.gamification_enabled}
                onToggle={() => handleToggle('gamification_enabled')}
                saving={upsert.isPending}
              />
              <FeatureToggle
                label="Photo Entries"
                description="Attach photos to log entries"
                value={prefs.photo_entries_enabled}
                onToggle={() => handleToggle('photo_entries_enabled')}
                saving={upsert.isPending}
              />
              <FeatureToggle
                label="Skill Tracking"
                description="Track individual skills within categories"
                value={prefs.skills_tracking_enabled}
                onToggle={() => handleToggle('skills_tracking_enabled')}
                saving={upsert.isPending}
              />
              <FeatureToggle
                label="Scrapbook Theme"
                description="Notebook paper, masking tape, craft aesthetic"
                value={prefs.scrapbook_theme_enabled}
                onToggle={() => handleToggle('scrapbook_theme_enabled')}
                saving={upsert.isPending}
              />
              <FeatureToggle
                label="Voice Input"
                description="Quick log with natural language parsing"
                value={prefs.voice_input_enabled}
                onToggle={() => handleToggle('voice_input_enabled')}
                saving={upsert.isPending}
              />
              <FeatureToggle
                label="Book Tracking"
                description="Track active read-aloud books"
                value={prefs.book_tracking_enabled}
                onToggle={() => handleToggle('book_tracking_enabled')}
                saving={upsert.isPending}
              />
            </View>

            <ScissorDivider style={styles.divider} />
          </>
        )}

        {/* About section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App</Text>
            <Text style={styles.infoValue}>LilLearner</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.1.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Built with</Text>
            <Text style={styles.infoValue}>Expo + React Native</Text>
          </View>

          <Text style={styles.description}>
            A simple learning tracker for homeschool families.
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  toggleText: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#333333',
  },
  toggleDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#8B7E6A',
    marginTop: 1,
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
