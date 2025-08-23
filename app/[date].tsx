import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, TextInput,  } from 'react-native';
import { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useColorScheme} from 'react-native';
import Colors from '@/constants/Colors';

interface Note {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: Date;
}

const NOTES_KEY = 'app_notes';
const THEME_KEY = 'app_theme';

export default function DayDetailScreen() {
  const params = useLocalSearchParams();
  const date = typeof params.date === 'string' ? params.date : params.date?.[0] || '';
  
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [adding, setAdding] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(colorScheme);

  // Загрузка заметок
  useEffect(() => {
    loadNotes();
    loadTheme();
  }, [date]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setCurrentTheme(savedTheme as 'light' | 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      const allNotes: Note[] = stored ? JSON.parse(stored) : [];
      const dateNotes = allNotes.filter(note => note.date === date);
      setNotes(dateNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    setAdding(true);
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        date: date,
        title: newTitle.trim(),
        content: newContent.trim(),
        createdAt: new Date()
      };

      const stored = await AsyncStorage.getItem(NOTES_KEY);
      const allNotes: Note[] = stored ? JSON.parse(stored) : [];
      const updatedNotes = [...allNotes, newNote];
      
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
      setNotes(prev => [...prev, newNote]);
      
      setNewTitle('');
      setNewContent('');
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAdding(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      const allNotes: Note[] = stored ? JSON.parse(stored) : [];
      const updatedNotes = allNotes.filter(note => note.id !== noteId);
      
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{ 
          title: `Запись за ${date}`,
          headerBackTitle: "Назад",
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Pressable onPress={toggleTheme} style={styles.themeButton}>
                <FontAwesome 
                  name={currentTheme === 'light' ? 'moon-o' : 'sun-o'} 
                  size={24} 
                  color={theme.text} 
                />
              </Pressable>
              <Pressable onPress={() => setModalVisible(true)} style={styles.plusButton}>
                <FontAwesome name="plus" size={24} color={theme.tint} />
              </Pressable>
            </View>
          )
        }} 
      />

      <ScrollView style={styles.scrollView}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="sticky-note-o" size={48} color="#ccc" />
            <Text style={[styles.emptyText, { color: theme.text }]}>Нет задач</Text>
            <Text style={[styles.emptySubtext, { color: theme.text }]}>Нажмите + чтобы добавить заметку</Text>
          </View>
        ) : (
          <View style={styles.notesList}>
            {notes.map((note) => (
              <View key={note.id} style={[
                styles.noteCard, 
                { 
                  backgroundColor: theme.cardBackground, 
                  borderColor: theme.cardBorder 
                }
              ]}>
                <Text style={[styles.noteTitle, { color: theme.text }]}>{note.title}</Text>
                <Text style={[styles.noteContent, { color: theme.taskText }]}>{note.content}</Text>
                <Text style={[styles.noteTime, { color: theme.text }]}>
                  {new Date(note.createdAt).toLocaleTimeString()}
                </Text>
                <Pressable 
                  style={styles.deleteButton}
                  onPress={() => deleteNote(note.id)}
                >
                  <FontAwesome name="trash-o" size={16} color="#ff4d4f" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Модальное окно добавления заметки */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent, 
            { backgroundColor: theme.background }
          ]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Добавить заметку</Text>
            
            <TextInput
              style={[
                styles.input, 
                { 
                  borderColor: theme.cardBorder, 
                  color: theme.text,
                  backgroundColor: theme.cardBackground
                }
              ]}
              placeholder="Заголовок"
              placeholderTextColor={theme.text}
              value={newTitle}
              onChangeText={setNewTitle}
              maxLength={50}
            />
            
            <TextInput
              style={[
                styles.input, 
                styles.textArea, 
                { 
                  borderColor: theme.cardBorder, 
                  color: theme.text,
                  backgroundColor: theme.cardBackground
                }
              ]}
              placeholder="Текст заметки"
              placeholderTextColor={theme.text}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Отмена</Text>
              </Pressable>
              
              <Pressable 
                style={[
                  styles.button, 
                  styles.addButton, 
                  (!newTitle.trim() || !newContent.trim()) && styles.disabledButton
                ]}
                onPress={addNote}
                disabled={!newTitle.trim() || !newContent.trim() || adding}
              >
                <Text style={styles.buttonText}>
                  {adding ? 'Добавление...' : 'Добавить'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  themeButton: {
    padding: 4,
  },
  plusButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  notesList: {
    padding: 16,
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  noteTime: {
    fontSize: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  addButton: {
    backgroundColor: '#1890ff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});