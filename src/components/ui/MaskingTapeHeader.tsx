import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fonts, spacing } from '../../config/theme';

interface MaskingTapeHeaderProps {
  title: string;
  style?: ViewStyle;
}

export function MaskingTapeHeader({ title, style }: MaskingTapeHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Rough edge top — thin semi-transparent strip */}
      <View style={styles.roughEdgeTop} />

      <View style={styles.tape}>
        <Text style={styles.text}>{title}</Text>
      </View>

      {/* Rough edge bottom */}
      <View style={styles.roughEdgeBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -8,
    marginVertical: spacing.md,
    transform: [{ rotate: '-2deg' }],
  },
  roughEdgeTop: {
    height: 2,
    backgroundColor: 'rgba(210, 180, 140, 0.3)',
    marginHorizontal: 4,
    borderRadius: 1,
  },
  tape: {
    backgroundColor: 'rgba(210, 180, 140, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roughEdgeBottom: {
    height: 2,
    backgroundColor: 'rgba(210, 180, 140, 0.3)',
    marginHorizontal: 2,
    borderRadius: 1,
  },
  text: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: '#8B7355',
  },
});
