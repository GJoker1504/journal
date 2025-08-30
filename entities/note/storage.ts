import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from './types';

const NOTES_KEY = 'app_notes';

export async function getNotes(): Promise<Note[]> {
  const stored = await AsyncStorage.getItem(NOTES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function saveNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
