import React, { useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ACHIEVEMENTS } from '../config/achievements';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementBadge } from './AchievementBadge';
import { MaskingTapeHeader } from './ui/MaskingTapeHeader';
import { spacing } from '../config/theme';

interface AchievementWallProps {
  childId: string;
}

export function AchievementWall({ childId }: AchievementWallProps) {
  const { data: unlockedAchievements } = useAchievements(childId);

  const unlockedMap = new Map(
    (unlockedAchievements ?? []).map((a) => [a.achievement_key, a.unlocked_at])
  );

  const handlePress = useCallback(
    (key: string) => {
      const achievement = ACHIEVEMENTS.find((a) => a.key === key);
      const unlockedAt = unlockedMap.get(key);

      if (achievement && unlockedAt) {
        const date = new Date(unlockedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

        Alert.alert(
          `${achievement.icon} ${achievement.name}`,
          `${achievement.description}\n\nUnlocked on ${date}`
        );
      }
    },
    [unlockedMap]
  );

  return (
    <View style={styles.container}>
      <MaskingTapeHeader title="Achievements" />

      <View style={styles.grid}>
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedMap.has(achievement.key);
          const unlockedAt = unlockedMap.get(achievement.key);

          return (
            <View key={achievement.key} style={styles.gridItem}>
              <AchievementBadge
                achievement={achievement}
                unlocked={isUnlocked}
                unlockedAt={unlockedAt}
                onPress={() => handlePress(achievement.key)}
                size={64}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
