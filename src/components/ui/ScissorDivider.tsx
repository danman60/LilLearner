import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../config/theme';

interface ScissorDividerProps {
  style?: ViewStyle;
}

export function ScissorDivider({ style }: ScissorDividerProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.scissors}>{'\u2702\uFE0F'}</Text>
      <View style={styles.dashedLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md - 4,
    paddingHorizontal: spacing.sm,
  },
  scissors: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: `${colors.pencilGray}60`,
    borderRadius: 0,
  },
});
