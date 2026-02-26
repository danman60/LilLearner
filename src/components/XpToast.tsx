import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts } from '../config/theme';
import { useToastStore } from '../stores/toastStore';

const { width, height } = Dimensions.get('window');

export function XpToast() {
  const xpAmount = useToastStore((s) => s.xpAmount);
  const clearToast = useToastStore((s) => s.clearToast);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (xpAmount !== null) {
      // Reset
      opacity.value = 0;
      translateY.value = 0;
      scale.value = 0.5;

      // Animate in
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) });

      // Float up and fade out
      translateY.value = withDelay(
        400,
        withTiming(-120, { duration: 1100, easing: Easing.out(Easing.ease) })
      );
      opacity.value = withDelay(
        800,
        withTiming(0, { duration: 700 }, (finished) => {
          if (finished) {
            runOnJS(clearToast)();
          }
        })
      );
      scale.value = withDelay(
        400,
        withTiming(0.8, { duration: 1100 })
      );
    }
  }, [xpAmount]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (xpAmount === null) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Animated.Text style={styles.text}>+{xpAmount} XP</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: height / 2 - 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  text: {
    fontFamily: fonts.accent,
    fontSize: 36,
    color: colors.craftYellow,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
