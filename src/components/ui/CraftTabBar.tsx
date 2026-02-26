import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, spacing } from '@/src/config/theme';

const TAB_CONFIG: Record<string, { emoji: string; label: string }> = {
  index: { emoji: '\uD83C\uDFE0', label: 'Home' },
  progress: { emoji: '\u2B50', label: 'Progress' },
  reports: { emoji: '\uD83D\uDCCA', label: 'Reports' },
  profile: { emoji: '\uD83D\uDC64', label: 'Profile' },
};

export function CraftTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Torn edge top decoration */}
      <View style={styles.tornEdge}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.tornSegment,
              {
                height: 4 + (((i * 7 + 3) % 5)),
                width: ((i % 3) === 0) ? 14 : ((i % 3) === 1) ? 18 : 12,
                backgroundColor: i % 2 === 0 ? '#F5E6D0' : '#EDD9C0',
                borderTopLeftRadius: i % 3 === 0 ? 3 : 5,
                borderTopRightRadius: i % 3 === 1 ? 5 : 2,
              },
            ]}
          />
        ))}
      </View>

      {/* Tab buttons */}
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? { emoji: '?', label: route.name };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {/* Active sticker circle behind emoji */}
              <View
                style={[
                  styles.emojiContainer,
                  isFocused && styles.emojiContainerActive,
                ]}
              >
                <Text style={styles.emoji}>{config.emoji}</Text>
              </View>

              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.pencilGray : '#B0A89A' },
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5E6D0',
    borderTopWidth: 0,
  },
  tornEdge: {
    flexDirection: 'row',
    overflow: 'hidden',
    height: 8,
    marginBottom: -1,
    alignItems: 'flex-end',
  },
  tornSegment: {
    flexShrink: 0,
    flexGrow: 1,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  emojiContainerActive: {
    backgroundColor: colors.craftYellow,
    // Give it a slightly hand-placed feel
    transform: [{ rotate: '-2deg' }],
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
});
