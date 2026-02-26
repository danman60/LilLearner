import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../config/theme';
import { CraftCard } from './ui/CraftCard';

interface StreakDisplayProps {
  streak: number;
}

function getFlameConfig(streak: number) {
  if (streak === 0) {
    return { emoji: '', size: 0, label: 'Start your streak!', sparkles: false };
  }
  if (streak <= 2) {
    return { emoji: '\uD83D\uDD25', size: 24, label: 'Keep it up!', sparkles: false };
  }
  if (streak <= 6) {
    return { emoji: '\uD83D\uDD25', size: 36, label: 'Getting warmer!', sparkles: false };
  }
  if (streak <= 29) {
    return { emoji: '\uD83D\uDD25', size: 48, label: 'On Fire!', sparkles: false };
  }
  return { emoji: '\uD83D\uDD25', size: 64, label: 'Unstoppable!', sparkles: true };
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const config = getFlameConfig(streak);

  return (
    <CraftCard color={`${colors.craftOrange}20`} index={5} style={styles.card}>
      <View style={styles.content}>
        {/* Flame area */}
        <View style={styles.flameContainer}>
          {config.emoji ? (
            <Text style={{ fontSize: config.size }}>{config.emoji}</Text>
          ) : (
            <Text style={styles.noFlameEmoji}>{'\uD83D\uDCA4'}</Text>
          )}
          {config.sparkles && (
            <>
              <Text style={[styles.sparkle, styles.sparkleTopLeft]}>{'\u2728'}</Text>
              <Text style={[styles.sparkle, styles.sparkleTopRight]}>{'\u2728'}</Text>
              <Text style={[styles.sparkle, styles.sparkleBottom]}>{'\u2728'}</Text>
            </>
          )}
        </View>

        {/* Streak count */}
        {streak > 0 ? (
          <View style={styles.textContainer}>
            <Text style={styles.streakCount}>{streak}</Text>
            <Text style={styles.streakLabel}>Day Streak!</Text>
          </View>
        ) : (
          <Text style={styles.streakLabel}>{config.label}</Text>
        )}

        {/* Sub-label */}
        {streak > 0 && (
          <Text style={styles.subLabel}>{config.label}</Text>
        )}
      </View>
    </CraftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  flameContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    marginBottom: spacing.sm,
  },
  noFlameEmoji: {
    fontSize: 32,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
  },
  sparkleTopLeft: {
    top: -4,
    left: -20,
  },
  sparkleTopRight: {
    top: -4,
    right: -20,
  },
  sparkleBottom: {
    bottom: -4,
    right: -16,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakCount: {
    fontFamily: fonts.accent,
    fontSize: 32,
    color: colors.craftOrange,
  },
  streakLabel: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.pencilGray,
  },
  subLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.craftOrange,
    marginTop: spacing.xs,
  },
});
