import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { colors } from '../../config/theme';
import { FEATURES } from '../../config/features';

interface PaperBackgroundProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

const LINE_SPACING = 28;
const LINE_COUNT = 40;
const MARGIN_LEFT = 40;

export function PaperBackground({
  children,
  scroll = true,
  style,
}: PaperBackgroundProps) {
  // Plain white background when scrapbook theme is off
  if (!FEATURES.SCRAPBOOK_THEME) {
    if (scroll) {
      return (
        <ScrollView
          style={[styles.plainScrollView, style]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return <View style={[styles.plainContainer, style]}>{children}</View>;
  }

  const lines = React.useMemo(() => {
    const result: React.ReactNode[] = [];
    for (let i = 0; i < LINE_COUNT; i++) {
      result.push(
        <View
          key={`line-${i}`}
          style={[
            styles.blueLine,
            { top: LINE_SPACING * (i + 1) },
          ]}
        />
      );
    }
    return result;
  }, []);

  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.linesContainer} pointerEvents="none">
        {lines}
        <View style={styles.redMargin} />
      </View>
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );

  if (scroll) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  plainScrollView: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  plainContainer: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.linedPaper,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.linedPaper,
    minHeight: Dimensions.get('window').height,
  },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  blueLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: colors.notebookBlue,
    opacity: 0.4,
  },
  redMargin: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: MARGIN_LEFT,
    width: 1,
    backgroundColor: colors.craftRed,
    opacity: 0.3,
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },
});
