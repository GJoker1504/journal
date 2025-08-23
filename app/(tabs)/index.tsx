import { StyleSheet, FlatList, Pressable, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import {useColorScheme} from 'react-native';
import Colors from '@/constants/Colors';

// Функция для форматирования даты с днем недели
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

// Интерфейс для заметок с датой- я бы type использовал
interface Note {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: Date;
}

const NOTES_KEY = 'app_notes';
const THEME_KEY = 'app_theme';

export default function TabOneScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [data, setData] = useState<any[]>([]);
  const [notesByDate, setNotesByDate] = useState<Record<string, Note[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  
  const colorScheme = useColorScheme();
  const theme = Colors[currentTheme];

  // Загрузка всех заметок и темы - Слейву вопрос Данька задавал - спс
  useEffect(() => {
    loadAllNotes();
    loadTheme();
  }, []);


  // Асинк опять также как и локал оказался легче чем предствлял
  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setCurrentTheme(savedTheme as 'light' | 'dark');
      } else {
        setCurrentTheme(colorScheme ?? 'light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  
  // Переключатель тем кривой - косой - но наш русский
  const toggleTheme = async () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

   // подгрузка для данных - не забудь  -
  const loadAllNotes = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTES_KEY);
      const allNotes: Note[] = stored ? JSON.parse(stored) : [];
      
      // Группируем заметки по датам
      const groupedNotes: Record<string, Note[]> = {};
      allNotes.forEach(note => {
        if (!groupedNotes[note.date]) {
          groupedNotes[note.date] = [];
        }
        groupedNotes[note.date].push(note);
      });
      
      setNotesByDate(groupedNotes);
      
      // Генерируем данные дат - я ии долбаеб - коменчу переменные ибо забываю их кто за что
      const pastData = generateDateData(new Date(), 5, 'past', true).reverse();
      const futureData = generateDateData(new Date(), 5, 'future', false);
      setData([...pastData, ...futureData]);
      
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Функция для подгрузки БУДУЩИХ дат - use calback gpt в мой код добавила - я не против конечно но зачем он тут хз - функция слишком мала чтоб использовать ее
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


   // Функция для получения заголовков задач для даты - хм я на этом этапе понял что ебанныйкопайлот переписывает мои функции в себе удобный код, уже править лень
  const getTaskTitles = (date: string) => {
    const notes = notesByDate[date] || [];
    return notes.slice(0, 3).map(note => note.title);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}//иишак вывела в это - у Дани спросить зачем и почему- мое флэт легче выглядил - пытался разобраться с рефами но не понял - подтяжка- доступ данных какая то
        data={data}
        renderItem={({ item }) => {
          const taskTitles = getTaskTitles(item.date);
          const hasNotes = taskTitles.length > 0;
          const totalNotes = notesByDate[item.date]?.length || 0;
          
          return (
            <Link 
              href={`/${item.date}`}
              asChild
            >
              <Pressable style={[
                styles.item,
                item.isToday && [styles.todayItem, { backgroundColor: theme.todayBackground }]
              ]}>
                <View style={styles.dateHeaderContainer}>
                  <Text style={[
                    styles.dayOfWeek,
                    { color: theme.text },
                    item.isToday && [styles.todayText, { color: theme.tint }]
                  ]}>
                    {item.dayOfWeek}
                  </Text>
                  <Text style={[
                    styles.dateHeader,
                    { color: theme.text },
                    item.isToday && [styles.todayText, { color: theme.tint }]
                  ]}>
                    {item.date}
                  </Text>
                </View>
                
                <View style={[
                  styles.taskContainer, 
                  { 
                    backgroundColor: theme.cardBackground, 
                    borderColor: theme.cardBorder 
                  }
                ]}>
                  {hasNotes ? (
                    <View style={styles.tasksList}>
                      {taskTitles.map((title, index) => (
                        <View key={index} style={styles.taskItem}>
                          <View style={[styles.dot, { backgroundColor: theme.dotColor }]} />
                          <Text style={[styles.taskTitle, { color: theme.taskText }]} numberOfLines={1}>
                            {title}
                          </Text>
                        </View>
                      ))}
                      {totalNotes > 3 && (
                        <Text style={[styles.moreTasks, { color: theme.moreTasks }]}>
                          + еще {totalNotes - 3} задач
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.taskText, { color: theme.text }]}>Нет задач</Text>
                  )}
                </View>
              </Pressable>
            </Link>
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

      {/* Кнопка переключения темы ебанный костыль*/}
      <Pressable 
        style={[styles.themeButton, { backgroundColor: theme.tint }]}
        onPress={toggleTheme}
      >
        <FontAwesome 
          name={currentTheme === 'light' ? 'moon-o' : 'sun-o'} 
          size={20} 
          color="white" 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  item: {
    marginBottom: 16,
  },
  todayItem: {
    borderRadius: 12,
    padding: 8,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '700',
  },
  taskContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  tasksList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    textAlign: 'center',
  },
  moreTasks: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  themeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}
);