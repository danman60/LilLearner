import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts } from '../../config/theme';

interface XpBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const SIZE_CONFIG = {
  small: { dimension: 32, fontSize: 14, starSize: 8, starOffset: -2 },
  medium: { dimension: 48, fontSize: 22, starSize: 12, starOffset: -3 },
  large: { dimension: 64, fontSize: 30, starSize: 14, starOffset: -4 },
} as const;

export function XpBadge({ level, size = 'medium', style }: XpBadgeProps) {
  const config = SIZE_CONFIG[size];

  return (
    <View
      style={[
        styles.container,
        {
          width: config.dimension,
          height: config.dimension,
          borderRadius: config.dimension / 2,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.level,
          { fontSize: config.fontSize },
        ]}
      >
        {level}
      </Text>

      {/* Star accent near top-right */}
      <Text
        style={[
          styles.star,
          {
            fontSize: config.starSize,
            top: config.starOffset,
            right: config.starOffset,
          },
        ]}
      >
        {'\u2B50'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.craftYellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  level: {
    fontFamily: fonts.accent,
    color: colors.pencilGray,
    textAlign: 'center',
  },
  star: {
    position: 'absolute',
  },
});
