import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, fonts, spacing } from '../config/theme';
import { AchievementConfig } from '../types';

interface AchievementBadgeProps {
  achievement: AchievementConfig;
  unlocked: boolean;
  unlockedAt?: string;
  onPress?: () => void;
  size?: number;
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  onPress,
  size = 64,
}: AchievementBadgeProps) {
  const borderSize = Math.max(2, size * 0.047);
  const iconSize = size * 0.5;
  const nameSize = Math.max(9, size * 0.16);

  const content = (
    <View style={[styles.container, { width: size + 16 }]}>
      {/* Badge circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: borderSize,
          },
          unlocked ? styles.circleUnlocked : styles.circleLocked,
        ]}
      >
        {/* Shine overlay for unlocked */}
        {unlocked && <View style={[styles.shineOverlay, { borderRadius: size / 2 }]} />}

        {/* Icon or question mark */}
        <Text
          style={[
            styles.icon,
            { fontSize: iconSize },
            !unlocked && styles.iconLocked,
          ]}
        >
          {unlocked ? achievement.icon : '?'}
        </Text>
      </View>

      {/* Ribbon banner with name */}
      <View style={[styles.ribbon, unlocked ? styles.ribbonUnlocked : styles.ribbonLocked]}>
        <Text
          style={[
            styles.name,
            { fontSize: nameSize },
            !unlocked && styles.nameLocked,
          ]}
          numberOfLines={1}
        >
          {achievement.name}
        </Text>
      </View>
    </View>
  );

  if (onPress && unlocked) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleUnlocked: {
    backgroundColor: colors.white,
    borderColor: colors.craftYellow,
    shadowColor: colors.craftYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  circleLocked: {
    backgroundColor: '#F0F0F0',
    borderColor: '#C0C0C0',
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  shineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    // Gradient-like shine from top-left
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  icon: {
    textAlign: 'center',
  },
  iconLocked: {
    fontFamily: fonts.accent,
    color: '#C0C0C0',
  },
  ribbon: {
    marginTop: -6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  ribbonUnlocked: {
    backgroundColor: colors.craftYellow,
  },
  ribbonLocked: {
    backgroundColor: '#D0D0D0',
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    color: colors.white,
    textAlign: 'center',
  },
  nameLocked: {
    color: colors.pencilGray,
    opacity: 0.5,
  },
});
