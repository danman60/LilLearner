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
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts } from '../config/theme';
import { getLevelTitle } from '../config/xp';
import { GoldStar } from './ui/GoldStar';
import { useLevelUpStore } from '../stores/levelUpStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COUNT = 25;
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

  // Memoize random values so they don't change on re-render
  const randomValues = useMemo(
    () => ({
      startX: Math.random() * SCREEN_WIDTH - SCREEN_WIDTH / 2,
      drift: (Math.random() - 0.5) * 100,
      fallDistance: SCREEN_HEIGHT + 100,
      rotateEnd: (Math.random() - 0.5) * 720,
      duration: 2000 + Math.random() * 1500,
      delay: Math.random() * 800,
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

export function LevelUpOverlay() {
  const newLevel = useLevelUpStore((s) => s.newLevel);
  const dismissLevelUp = useLevelUpStore((s) => s.dismissLevelUp);

  const overlayOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.3);
  const titleOpacity = useSharedValue(0);
  const levelScale = useSharedValue(0);
  const levelOpacity = useSharedValue(0);

  const handleDismiss = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(dismissLevelUp)();
      }
    });
    titleOpacity.value = withTiming(0, { duration: 200 });
    levelOpacity.value = withTiming(0, { duration: 200 });
  }, [dismissLevelUp]);

  useEffect(() => {
    if (newLevel !== null) {
      // Reset values
      overlayOpacity.value = 0;
      titleScale.value = 0.3;
      titleOpacity.value = 0;
      levelScale.value = 0;
      levelOpacity.value = 0;

      // Animate in
      overlayOpacity.value = withTiming(1, { duration: 300 });

      // Title bounces in
      titleOpacity.value = withDelay(200, withTiming(1, { duration: 200 }));
      titleScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 6, stiffness: 150 }),
          withSpring(1, { damping: 10, stiffness: 100 })
        )
      );

      // Level number fades in
      levelOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
      levelScale.value = withDelay(
        600,
        withSpring(1, { damping: 8, stiffness: 120 })
      );

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [newLevel]);

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const levelAnimStyle = useAnimatedStyle(() => ({
    opacity: levelOpacity.value,
    transform: [{ scale: levelScale.value }],
  }));

  if (newLevel === null) return null;

  const levelTitle = getLevelTitle(newLevel);

  return (
    <TouchableWithoutFeedback onPress={handleDismiss}>
      <Animated.View style={[styles.overlay, overlayAnimStyle]}>
        {/* Confetti */}
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece key={i} index={i} visible={newLevel !== null} />
        ))}

        {/* Center content */}
        <View style={styles.content}>
          {/* Gold star drops from top */}
          <GoldStar size={64} animated delay={100} />

          {/* LEVEL UP text */}
          <Animated.Text style={[styles.levelUpText, titleAnimStyle]}>
            LEVEL UP!
          </Animated.Text>

          {/* New level number */}
          <Animated.View style={[styles.levelCircle, levelAnimStyle]}>
            <Text style={styles.levelNumber}>{newLevel}</Text>
          </Animated.View>

          {/* Level title */}
          <Animated.Text style={[styles.levelTitle, levelAnimStyle]}>
            {levelTitle}
          </Animated.Text>
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
    zIndex: 10000,
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
  levelUpText: {
    fontFamily: fonts.accent,
    fontSize: 44,
    color: colors.craftYellow,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
    marginTop: 16,
    marginBottom: 20,
  },
  levelCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.craftYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  levelNumber: {
    fontFamily: fonts.accent,
    fontSize: 36,
    color: colors.pencilGray,
  },
  levelTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
});
