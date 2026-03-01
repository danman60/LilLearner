import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../config/theme';
import { parseVoiceNote } from '../lib/voiceNoteParser';
import { useChildren } from '../hooks/useChildren';
import { useUserCategories } from '../hooks/useUserCategories';
import { CATEGORIES } from '../config/categories';
import { ParsedEntry } from '../types/voice';

interface VoiceButtonProps {
  onEntriesParsed: (entries: ParsedEntry[], rawText: string) => void;
}

export function VoiceButton({ onEntriesParsed }: VoiceButtonProps) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: children } = useChildren();
  const { data: userCategories } = useUserCategories();

  const handleParse = async () => {
    if (!text.trim()) return;
    setError(null);
    setParsing(true);

    try {
      const result = await parseVoiceNote(
        text,
        children ?? [],
        userCategories ?? [],
        CATEGORIES
      );

      if (result.entries.length === 0) {
        setError('No log entries found. Try something like "Amelia did reading lesson 58 and math lesson 42"');
        setParsing(false);
        return;
      }

      onEntriesParsed(result.entries, text);
      setText('');
      setVisible(false);
    } catch (err) {
      setError('Failed to parse. Please try again.');
      console.error('[VoiceButton] Parse error:', err);
    } finally {
      setParsing(false);
    }
  };

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={styles.quickLogButton}>
        <Text style={styles.quickLogIcon}>{'\uD83C\uDF99\uFE0F'}</Text>
        <Text style={styles.quickLogText}>Quick Log</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Log</Text>
            <Text style={styles.modalHint}>
              Type what you did today. Example: "Amelia did reading lesson 58 and math lesson 42. We also went to the park."
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="What did you do today?"
              placeholderTextColor="#B0A89A"
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              autoFocus
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setText('');
                  setError(null);
                  setVisible(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleParse}
                style={[styles.parseButton, parsing && styles.parseButtonDisabled]}
                disabled={parsing || !text.trim()}
              >
                {parsing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.parseButtonText}>Parse & Review</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  quickLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    alignSelf: 'center',
    marginVertical: spacing.sm,
    ...shadows.small,
  },
  quickLogIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  quickLogText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: '#333333',
    marginBottom: spacing.xs,
  },
  modalHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8B7E6A',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  textInput: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F9F9F9',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.craftRed,
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#8B7E6A',
  },
  parseButton: {
    backgroundColor: '#333333',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    minWidth: 140,
    alignItems: 'center',
  },
  parseButtonDisabled: {
    opacity: 0.5,
  },
  parseButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
