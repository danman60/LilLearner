import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fonts, spacing } from '../../config/theme';
import { useFeature } from '../../stores/featureStore';

interface MaskingTapeHeaderProps {
  title: string;
  style?: ViewStyle;
}

export function MaskingTapeHeader({ title, style }: MaskingTapeHeaderProps) {
  const scrapbook = useFeature('SCRAPBOOK_THEME');

  // Plain bold text when scrapbook theme is off
  if (!scrapbook) {
    return (
      <View style={[styles.plainContainer, style]}>
        <Text style={styles.plainText}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.roughEdgeTop} />
      <View style={styles.tape}>
        <Text style={styles.text}>{title}</Text>
      </View>
      <View style={styles.roughEdgeBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  plainContainer: {
    marginVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  plainText: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: '#333333',
  },
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
