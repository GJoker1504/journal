import { StyleSheet, FlatList, Pressable, View } from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import DayCard from '@/components/DayCard';
import { useThemeContext } from '@/shared/ThemeContext';
import { Stack } from 'expo-router';

const formatDateWithDay = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const dayOfWeek = daysOfWeek[date.getDay()];
  return {
    date: `${day}.${month}.${year}`,
    dayOfWeek: dayOfWeek,
    isToday: isToday(date)
  };
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

const generateDateData = (startDate: Date, count: number, direction: 'future' | 'past' = 'future', excludeToday: boolean = false) => {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(startDate);
    if (direction === 'future') {
      date.setDate(date.getDate() + index + (excludeToday ? 1 : 0));
    } else {
      date.setDate(date.getDate() - index - (excludeToday ? 1 : 0));
    }
    const formattedDate = formatDateWithDay(date);
    return {
      id: `${direction}-${date.getTime()}-${index}`,
      date: formattedDate.date,
      dayOfWeek: formattedDate.dayOfWeek,
      isToday: formattedDate.isToday,
    };
  });
};

interface Note {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: Date;
}

const NOTES_KEY = 'app_notes';

export default function TabOneScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [data, setData] = useState<any[]>([]);
  const [notesByDate, setNotesByDate] = useState<Record<string, Note[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { theme, toggleTheme } = useThemeContext();
  const colorTheme = Colors[theme];

  useEffect(() => {
    loadAllNotes();
  }, []);

  const loadAllNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      const allNotes: Note[] = stored ? JSON.parse(stored) : [];
      const groupedNotes: Record<string, Note[]> = {};
      allNotes.forEach(note => {
        if (!groupedNotes[note.date]) {
          groupedNotes[note.date] = [];
        }
        groupedNotes[note.date].push(note);
      });
      setNotesByDate(groupedNotes);
      const pastData = generateDateData(new Date(), 5, 'past', true).reverse();
      const futureData = generateDateData(new Date(), 5, 'future', false);
      setData([...pastData, ...futureData]);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadMoreFuture = useCallback(() => {
    if (isLoading || data.length === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      const lastDate = new Date(data[data.length - 1].date.split('.').reverse().join('-'));
      lastDate.setDate(lastDate.getDate() + 1);
      const newData = generateDateData(lastDate, 3, 'future');
      setData(prevData => [...prevData, ...newData]);
      setIsLoading(false);
    }, 50);
  }, [data, isLoading]);

  const loadMorePast = useCallback(() => {
    if (isLoading || data.length === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      const firstDate = new Date(data[0].date.split('.').reverse().join('-'));
      firstDate.setDate(firstDate.getDate() - 1);
      const newData = generateDateData(firstDate, 3, 'past', true);
      setData(prevData => [...newData.reverse(), ...prevData]);
      setIsLoading(false);
    }, 50);
  }, [data, isLoading]);

  const getTaskTitles = (date: string) => {
    const notes = notesByDate[date] || [];
    return notes.slice(0, 3).map(note => note.title);
  };

  return (
    <View style={[styles.container, { backgroundColor: colorTheme.background }]}>
      <Stack.Screen
        options={{
          title: 'Главная',
          headerStyle: { backgroundColor: colorTheme.background },
          headerTintColor: colorTheme.text,
          headerRight: () => (
            <Pressable 
              style={[styles.themeButton, { backgroundColor: colorTheme.tint }]}
              onPress={toggleTheme}
            >
              <FontAwesome 
                name={theme === 'light' ? 'moon-o' : 'sun-o'} 
                size={20} 
                color={theme === 'light' ? '#fff' : '#000'}
              />
            </Pressable>
          ),
        }}
      />
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => {
          const taskTitles = getTaskTitles(item.date);
          const totalNotes = notesByDate[item.date]?.length || 0;
          return (
            <DayCard
              item={item}
              taskTitles={taskTitles}
              totalNotes={totalNotes}
              theme={colorTheme}
            />
          );
        }}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreFuture}
        onEndReachedThreshold={0.3}
        onStartReached={loadMorePast}
        onStartReachedThreshold={0.3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  themeButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});