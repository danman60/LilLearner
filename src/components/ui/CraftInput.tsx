import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { colors, fonts, spacing } from '../../config/theme';

interface CraftInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}

export function CraftInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  style,
}: CraftInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.craftRed
    : isFocused
    ? colors.craftBlue
    : colors.pencilGray;

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TextInput
        style={[
          styles.input,
          { borderBottomColor: borderColor },
        ]}
        placeholder={placeholder}
        placeholderTextColor={`${colors.pencilGray}80`}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.pencilGray,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.black,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.pencilGray,
  },
  error: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.craftRed,
    marginTop: spacing.xs,
  },
});
