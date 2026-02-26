import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { colors } from '../../config/theme';

interface GoldStarProps {
  size?: number;
  animated?: boolean;
  delay?: number;
  style?: ViewStyle;
}

function getStarPoints(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const points: number[] = [];
  for (let i = 0; i < 5; i++) {
    // Outer point
    const outerAngle = (i * 72 - 90) * (Math.PI / 180);
    points.push(cx + r * Math.cos(outerAngle));
    points.push(cy + r * Math.sin(outerAngle));
    // Inner point
    const innerAngle = (i * 72 + 36 - 90) * (Math.PI / 180);
    points.push(cx + r * 0.4 * Math.cos(innerAngle));
    points.push(cy + r * 0.4 * Math.sin(innerAngle));
  }

  // Convert pairs to "x,y" format
  const pairs: string[] = [];
  for (let i = 0; i < points.length; i += 2) {
    pairs.push(`${points[i]},${points[i + 1]}`);
  }
  return pairs.join(' ');
}

export function GoldStar({
  size = 24,
  animated = false,
  delay: animDelay = 0,
  style,
}: GoldStarProps) {
  const translateY = useSharedValue(animated ? -60 : 0);
  const scale = useSharedValue(animated ? 0 : 1);
  const opacity = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) return;

    // Drop in from above with bounce
    translateY.value = withDelay(
      animDelay,
      withSpring(0, {
        damping: 8,
        stiffness: 120,
        mass: 0.8,
      })
    );

    scale.value = withDelay(
      animDelay,
      withSequence(
        withTiming(1.2, { duration: 200 }),
        withSpring(1, { damping: 6, stiffness: 100 })
      )
    );

    opacity.value = withDelay(animDelay, withTiming(1, { duration: 150 }));
  }, [animated, animDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const starPoints = getStarPoints(size);

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle, style]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Polygon points={starPoints} fill={colors.craftYellow} />
      </Svg>
    </Animated.View>
  );
}
