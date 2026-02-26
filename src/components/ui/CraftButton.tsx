import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, fonts, spacing, shadows } from '../../config/theme';

interface CraftButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

// Seeded pseudo-random for consistent rotation per title
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return ((hash % 200) / 100); // returns -1 to ~1
}

const SIZE_CONFIG = {
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  medium: {
    paddingVertical: spacing.md - 4,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    fontSize: 18,
  },
} as const;

export function CraftButton({
  title,
  onPress,
  color = colors.craftBlue,
  textColor = colors.white,
  loading = false,
  disabled = false,
  size = 'medium',
  style,
}: CraftButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotation = seededRandom(title);
  const sizeConfig = SIZE_CONFIG[size];

  // Irregular border radii for the construction paper look
  const cornerRadii = {
    borderTopLeftRadius: 12 + Math.abs(rotation) * 2,
    borderTopRightRadius: 16 - Math.abs(rotation) * 2,
    borderBottomLeftRadius: 14 + rotation,
    borderBottomRightRadius: 10 - rotation,
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.button,
          cornerRadii,
          {
            backgroundColor: color,
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            transform: [
              { scale: scaleAnim },
              { rotate: `${rotation}deg` },
            ],
            opacity: disabled ? 0.5 : 1,
          },
          shadows.medium,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize: sizeConfig.fontSize },
            ]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
  },
});
