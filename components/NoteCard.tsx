import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type Props = {
  title: string;
  content: string;
  createdAt: string;
  onDelete: () => void;
  colorTheme: any;
};

export default function NoteCard({ title, content, createdAt, onDelete, colorTheme }: Props) {
  return (
    <View style={[
      styles.noteCard, 
      { backgroundColor: colorTheme.cardBackground, borderColor: colorTheme.cardBorder }
    ]}>
      <Text style={[styles.noteTitle, { color: colorTheme.text }]}>{title}</Text>
      <Text style={[styles.noteContent, { color: colorTheme.taskText }]}>{content}</Text>
      <Text style={[styles.noteTime, { color: colorTheme.text }]}>
        {new Date(createdAt).toLocaleTimeString()}
      </Text>
      <Pressable 
        style={styles.deleteButton}
        onPress={onDelete}
      >
        <FontAwesome name="trash-o" size={16} color="#ff4d4f" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  noteCard: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, position: 'relative' },
  noteTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  noteContent: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  noteTime: { fontSize: 12 },
  deleteButton: { position: 'absolute', top: 8, right: 8, padding: 4 },
});