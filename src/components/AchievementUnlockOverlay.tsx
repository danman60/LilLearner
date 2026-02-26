import React, { useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  View,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts, spacing } from '../config/theme';
import { getAchievementByKey } from '../config/achievements';
import { useAchievementUnlockStore } from '../stores/achievementUnlockStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COUNT = 20;
const CONFETTI_COLORS = [
  colors.craftRed,
  colors.craftYellow,
  colors.craftBlue,
  colors.craftGreen,
  colors.craftPurple,
  colors.craftOrange,
];

interface ConfettiPieceProps {
  index: number;
  visible: boolean;
}

function ConfettiPiece({ index, visible }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  const randomValues = useMemo(
    () => ({
      startX: Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2,
      drift: (Math.random() - 0.5) * 100,
      fallDistance: SCREEN_HEIGHT + 100,
      rotateEnd: (Math.random() - 0.5) * 720,
      duration: 2000 + Math.random() * 1500,
      delay: Math.random() * 600,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      width: 8 + Math.random() * 12,
      height: 6 + Math.random() * 10,
      borderRadius: Math.random() > 0.5 ? 2 : 0,
    }),
    [index]
  );

  useEffect(() => {
    if (visible) {
      translateY.value = -50;
      translateX.value = randomValues.startX;
      rotate.value = 0;
      opacity.value = 0;

      opacity.value = withDelay(
        randomValues.delay,
        withTiming(1, { duration: 100 })
      );

      translateY.value = withDelay(
        randomValues.delay,
        withTiming(randomValues.fallDistance, {
          duration: randomValues.duration,
          easing: Easing.in(Easing.quad),
        })
      );

      translateX.value = withDelay(
        randomValues.delay,
        withTiming(randomValues.startX + randomValues.drift, {
          duration: randomValues.duration,
        })
      );

      rotate.value = withDelay(
        randomValues.delay,
        withTiming(randomValues.rotateEnd, {
          duration: randomValues.duration,
        })
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          width: randomValues.width,
          height: randomValues.height,
          backgroundColor: randomValues.color,
          borderRadius: randomValues.borderRadius,
        },
        animStyle,
      ]}
    />
  );
}

export function AchievementUnlockOverlay() {
  const achievementKey = useAchievementUnlockStore((s) => s.achievementKey);
  const dismissUnlock = useAchievementUnlockStore((s) => s.dismissUnlock);

  const overlayOpacity = useSharedValue(0);
  const badgeTranslateY = useSharedValue(200);
  const badgeOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const handleDismiss = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(dismissUnlock)();
      }
    });
    badgeOpacity.value = withTiming(0, { duration: 200 });
    textOpacity.value = withTiming(0, { duration: 200 });
  }, [dismissUnlock]);

  useEffect(() => {
    if (achievementKey !== null) {
      // Reset
      overlayOpacity.value = 0;
      badgeTranslateY.value = 200;
      badgeOpacity.value = 0;
      textOpacity.value = 0;

      // Animate in
      overlayOpacity.value = withTiming(1, { duration: 300 });

      // Badge slides up with spring bounce
      badgeOpacity.value = withDelay(200, withTiming(1, { duration: 200 }));
      badgeTranslateY.value = withDelay(
        200,
        withSpring(0, { damping: 8, stiffness: 100, mass: 0.8 })
      );

      // Text fades in
      textOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [achievementKey]);

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeTranslateY.value }],
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (achievementKey === null) return null;

  const achievement = getAchievementByKey(achievementKey);
  if (!achievement) return null;

  return (
    <TouchableWithoutFeedback onPress={handleDismiss}>
      <Animated.View style={[styles.overlay, overlayAnimStyle]}>
        {/* Confetti */}
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece key={i} index={i} visible={achievementKey !== null} />
        ))}

        {/* Center content */}
        <View style={styles.content}>
          {/* Achievement Unlocked title */}
          <Animated.Text style={[styles.unlockedTitle, textAnimStyle]}>
            Achievement Unlocked!
          </Animated.Text>

          {/* Badge */}
          <Animated.View style={[styles.badgeContainer, badgeAnimStyle]}>
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeIcon}>{achievement.icon}</Text>
            </View>
          </Animated.View>

          {/* Achievement name and description */}
          <Animated.View style={[styles.textContainer, textAnimStyle]}>
            <Text style={styles.achievementName}>{achievement.name}</Text>
            <Text style={styles.achievementDesc}>{achievement.description}</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10001,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
    left: SCREEN_WIDTH / 2,
  },
  unlockedTitle: {
    fontFamily: fonts.accent,
    fontSize: 32,
    color: colors.craftYellow,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  badgeContainer: {
    marginBottom: spacing.lg,
  },
  badgeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.craftYellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.craftYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  achievementName: {
    fontFamily: fonts.accent,
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementDesc: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
