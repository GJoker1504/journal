import { useState, useEffect } from 'react';
import { getNotes, saveNotes } from '@/entities/note/storage';
import { Note } from '@/entities/note/types';

export function useNotes(date?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => {
    getNotes().then(allNotes => {
      setNotes(date ? allNotes.filter(n => n.date === date) : allNotes);
    });
  }, [date]);
  return { notes, setNotes };
}