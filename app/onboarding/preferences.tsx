import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { useUpsertPreferences } from '@/src/hooks/useUserPreferences';

interface PreferenceToggle {
  key: string;
  label: string;
  description: string;
}

const TOGGLES: PreferenceToggle[] = [
  {
    key: 'gamification_enabled',
    label: 'XP & Levels',
    description: 'Earn XP, level up, unlock achievements',
  },
  {
    key: 'photo_entries_enabled',
    label: 'Photo Entries',
    description: 'Attach photos to log entries',
  },
  {
    key: 'skills_tracking_enabled',
    label: 'Skill Tracking',
    description: 'Track individual skills within categories',
  },
  {
    key: 'scrapbook_theme_enabled',
    label: 'Scrapbook Theme',
    description: 'Notebook paper, masking tape, craft aesthetic',
  },
];

export default function OnboardingPreferencesScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    gamification_enabled: false,
    photo_entries_enabled: false,
    skills_tracking_enabled: false,
    scrapbook_theme_enabled: false,
    voice_input_enabled: true,
    book_tracking_enabled: true,
  });

  const upsert = useUpsertPreferences();
  const router = useRouter();

  const handleToggle = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDone = async () => {
    try {
      await upsert.mutateAsync({
        ...prefs,
        onboarding_completed: true,
      });
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Could not save preferences. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How do you want to use the app?</Text>
        <Text style={styles.subtitle}>
          Start simple — you can turn these on anytime in Settings.
        </Text>

        <View style={styles.toggleList}>
          {TOGGLES.map((toggle) => (
            <View key={toggle.key} style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>{toggle.label}</Text>
                <Text style={styles.toggleDesc}>{toggle.description}</Text>
              </View>
              <Switch
                value={prefs[toggle.key] ?? false}
                onValueChange={() => handleToggle(toggle.key)}
                trackColor={{ false: '#E0E0E0', true: '#5B9BD5' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleDone}
          style={[styles.doneButton, upsert.isPending && styles.doneButtonDisabled]}
          disabled={upsert.isPending}
        >
          <Text style={styles.doneButtonText}>
            {upsert.isPending ? 'Saving...' : 'Get Started'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    color: '#333333',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#8B7E6A',
    marginBottom: spacing.xl,
  },
  toggleList: {
    gap: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.small,
  },
  toggleText: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: '#333333',
  },
  toggleDesc: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8B7E6A',
    marginTop: 2,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  doneButton: {
    backgroundColor: '#333333',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
