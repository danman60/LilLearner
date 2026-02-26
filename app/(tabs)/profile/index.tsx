import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/src/config/theme';
import { PaperBackground } from '@/src/components/ui/PaperBackground';
import { MaskingTapeHeader } from '@/src/components/ui/MaskingTapeHeader';
import { CraftButton } from '@/src/components/ui/CraftButton';
import { ScissorDivider } from '@/src/components/ui/ScissorDivider';
import { ProfileCard } from '@/src/components/ProfileCard';
import { ChildProfileCard } from '@/src/components/ChildProfileCard';
import ChildSwitcher from '@/src/components/ChildSwitcher';
import { useChildren } from '@/src/hooks/useChildren';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: children } = useChildren();

  return (
    <PaperBackground scroll>
      <View style={styles.content}>
        <MaskingTapeHeader title="My Profile" />

        {/* Profile card */}
        <ProfileCard />

        {/* My Learners header */}
        <MaskingTapeHeader title="My Learners" style={styles.learnersHeader} />

        {/* Child switcher */}
        <ChildSwitcher />

        {/* Child profile cards */}
        {children?.map((child, index) => (
          <ChildProfileCard key={child.id} child={child} index={index} />
        ))}

        {/* Add learner button */}
        <View style={styles.addButtonContainer}>
          <CraftButton
            title="+ Add Learner"
            onPress={() => router.push('/(tabs)/profile/add-child')}
            color={colors.craftGreen}
            size="medium"
          />
        </View>

        <ScissorDivider style={styles.divider} />

        {/* Settings button */}
        <View style={styles.settingsContainer}>
          <CraftButton
            title="Settings"
            onPress={() => router.push('/(tabs)/profile/settings')}
            color={colors.craftOrange}
            size="medium"
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
    paddingBottom: spacing.xxl,
  },
  learnersHeader: {
    marginTop: spacing.lg,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  settingsContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  bottomPad: {
    height: spacing.xxl * 2,
  },
});
