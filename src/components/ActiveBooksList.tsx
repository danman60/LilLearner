import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../config/theme';
import { useActiveBooks, useAddBook, useFinishBook } from '../hooks/useActiveBooks';
import { ActiveBook } from '../types';

interface ActiveBooksListProps {
  childId: string;
  categoryId: string;
}

function BookRow({ book, onFinish }: { book: ActiveBook; onFinish: (id: string) => void }) {
  const isReading = book.status === 'reading';

  return (
    <View style={[styles.bookRow, !isReading && styles.bookRowFinished]}>
      <Text style={styles.bookIcon}>{isReading ? '\uD83D\uDCD6' : '\u2705'}</Text>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.bookStatus}>
          {isReading ? 'Currently reading' : 'Finished'}
        </Text>
      </View>
      {isReading && (
        <Pressable onPress={() => onFinish(book.id)} style={styles.finishButton}>
          <Text style={styles.finishButtonText}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}

export function ActiveBooksList({ childId, categoryId }: ActiveBooksListProps) {
  const { data: books } = useActiveBooks(childId, categoryId);
  const addBook = useAddBook();
  const finishBook = useFinishBook();
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    addBook.mutate(
      { child_id: childId, category_id: categoryId, title },
      { onSuccess: () => setNewTitle('') }
    );
  };

  const handleFinish = (bookId: string) => {
    Alert.alert('Finish book?', 'Mark this book as finished?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Done', onPress: () => finishBook.mutate(bookId) },
    ]);
  };

  const activeBooks = books?.filter((b) => b.status === 'reading') ?? [];
  const finishedBooks = books?.filter((b) => b.status === 'finished') ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Active Books</Text>

      {activeBooks.map((book) => (
        <BookRow key={book.id} book={book} onFinish={handleFinish} />
      ))}

      {activeBooks.length === 0 && (
        <Text style={styles.emptyText}>No active books yet</Text>
      )}

      {/* Add new book */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add a book title..."
          placeholderTextColor="#B0A89A"
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Pressable
          onPress={handleAdd}
          style={[styles.addButton, addBook.isPending && styles.addButtonDisabled]}
          disabled={addBook.isPending}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {/* Finished books */}
      {finishedBooks.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.finishedTitle]}>
            Finished ({finishedBooks.length})
          </Text>
          {finishedBooks.slice(0, 5).map((book) => (
            <BookRow key={book.id} book={book} onFinish={handleFinish} />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: '#333333',
    marginBottom: spacing.sm,
  },
  finishedTitle: {
    marginTop: spacing.lg,
    color: '#8B7E6A',
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warmWhite,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
    ...shadows.small,
  },
  bookRowFinished: {
    opacity: 0.6,
  },
  bookIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#333333',
  },
  bookStatus: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#8B7E6A',
    marginTop: 1,
  },
  finishButton: {
    backgroundColor: '#6BBF6B',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  finishButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    paddingVertical: spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#333333',
    backgroundColor: colors.warmGray,
    borderRadius: borderRadius.sm,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(139, 126, 106, 0.15)',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5B9BD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: -2,
  },
});
