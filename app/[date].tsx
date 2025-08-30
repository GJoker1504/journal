import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useNotes } from '@/features/note/useNotes';
import { useTheme } from '@/features/theme/useTheme';
import Colors from '@/constants/Colors';
import NoteCard from '@/components/NoteCard';
import AddNoteModal from '@/components/AddNoteModal';

export default function DayDetailScreen() {
  const params = useLocalSearchParams();
  const date = typeof params.date === 'string' ? params.date : params.date?.[0] || '';
  const { theme, toggleTheme } = useTheme();
  const colorTheme = Colors[theme];
  const { notes, setNotes } = useNotes(date);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [adding, setAdding] = useState(false);

  const addNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setAdding(true);
    const newNote = {
      id: Date.now().toString(),
      date,
      title: newTitle.trim(),
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setNewTitle('');
    setNewContent('');
    setModalVisible(false);
    setAdding(false);
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  if (!notes) {
    return (
      <View style={[styles.center, { backgroundColor: colorTheme.background }]}>
        <ActivityIndicator size="large" color={colorTheme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorTheme.background }]}>
      <Stack.Screen 
        options={{ 
          title: `Запись за ${date}`,
          headerBackTitle: "Назад",
          headerStyle: { backgroundColor: colorTheme.background },
          headerTintColor: colorTheme.text,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable onPress={toggleTheme} style={styles.themeButton}>
                <FontAwesome 
                  name={theme === 'light' ? 'moon-o' : 'sun-o'} 
                  size={24} 
                  color={colorTheme.text} 
                />
              </Pressable>
              <Pressable onPress={() => setModalVisible(true)} style={styles.plusButton}>
                <FontAwesome name="plus" size={24} color={colorTheme.tint} />
              </Pressable>
            </View>
          )
        }} 
      />
      <ScrollView style={styles.scrollView}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="sticky-note-o" size={48} color="#ccc" />
            <Text style={[styles.emptyText, { color: colorTheme.text }]}>Нет задач</Text>
            <Text style={[styles.emptySubtext, { color: colorTheme.text }]}>Нажмите + чтобы добавить заметку</Text>
          </View>
        ) : (
          <View style={styles.notesList}>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                title={note.title}
                content={note.content}
                createdAt={note.createdAt}
                onDelete={() => deleteNote(note.id)}
                colorTheme={colorTheme}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <AddNoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addNote}
        title={newTitle}
        setTitle={setNewTitle}
        content={newContent}
        setContent={setNewContent}
        adding={adding}
        colorTheme={colorTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  themeButton: { padding: 4 },
  plusButton: { padding: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  emptyText: { fontSize: 18, marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  notesList: { padding: 16 },
});