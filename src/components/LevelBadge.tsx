import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, spacing } from '../config/theme';
import { GoldStar } from './ui/GoldStar';

interface LevelBadgeProps {
  level: number;
  title: string;
  style?: ViewStyle;
}

export function LevelBadge({ level, title, style }: LevelBadgeProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Dashed outer ring */}
      <View style={styles.outerRing}>
        {/* Inner circle */}
        <View style={styles.innerCircle}>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
      </View>

      {/* Level title below */}
      <Text style={styles.levelTitle}>{title}</Text>

      {/* Decorative gold stars */}
      <GoldStar size={14} style={styles.starTopRight} />
      <GoldStar size={12} style={styles.starTopLeft} />
      <GoldStar size={10} style={styles.starBottomRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  outerRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.craftYellow,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.craftYellow,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  levelNumber: {
    fontFamily: fonts.accent,
    fontSize: 28,
    color: colors.pencilGray,
    textAlign: 'center',
  },
  levelTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.pencilGray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  starTopRight: {
    position: 'absolute',
    top: 4,
    right: 8,
  },
  starTopLeft: {
    position: 'absolute',
    top: 12,
    left: 10,
  },
  starBottomRight: {
    position: 'absolute',
    bottom: 24,
    right: 4,
  },
});
