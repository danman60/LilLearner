import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/src/config/theme';

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📈</Text>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.subtitle}>Track your little learner's growth!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.linedPaper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    color: colors.pencilGray,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#8B7E6A',
    textAlign: 'center',
  },
});
