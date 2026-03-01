import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../config/theme';
import { useFeature } from '../../stores/featureStore';

interface CraftCardProps {
  children: React.ReactNode;
  color?: string;
  index?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

function getRotation(index: number): number {
  const seed = ((index * 7 + 13) % 20) - 10;
  return seed / 10;
}

export function CraftCard({
  children,
  color = colors.white,
  index = 0,
  onPress,
  onLongPress,
  style,
}: CraftCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const scrapbook = useFeature('SCRAPBOOK_THEME');

  const isInteractive = onPress || onLongPress;

  const handlePressIn = () => {
    if (!isInteractive) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(liftAnim, {
        toValue: -2,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!isInteractive) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(liftAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
    ]).start();
  };

  // Plain card when scrapbook theme is off — no rotation, uniform radius
  if (!scrapbook) {
    const plainContent = (
      <View
        style={[
          styles.plainCard,
          { backgroundColor: color },
          shadows.small,
          style,
        ]}
      >
        {children}
      </View>
    );

    if (isInteractive) {
      return (
        <Pressable onPress={onPress} onLongPress={onLongPress}>
          {plainContent}
        </Pressable>
      );
    }
    return plainContent;
  }

  // Scrapbook card — rotation, irregular corners, spring animation
  const rotation = getRotation(index);
  const cornerRadii = {
    borderTopLeftRadius: borderRadius.md + (index % 3),
    borderTopRightRadius: borderRadius.md + ((index + 1) % 4),
    borderBottomLeftRadius: borderRadius.md + ((index + 2) % 3),
    borderBottomRightRadius: borderRadius.md + (index % 5),
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        cornerRadii,
        shadows.medium,
        {
          backgroundColor: color,
          transform: [
            { scale: scaleAnim },
            { translateY: liftAnim },
            { rotate: `${rotation}deg` },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (isInteractive) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  plainCard: {
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  card: {
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
});
