import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);

  // Генерация календаря на текущий месяц
  useEffect(() => {
    generateCalendar();
  }, []);

  const generateCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Первый день месяца
    const firstDay = new Date(year, month, 1);
    // Последний день месяца
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 (воскресенье) до 6 (суббота)
    
    const days = [];
    
    // Пустые дни в начале месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isToday: false, isCurrentMonth: false });
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        date: formatDate(date),
        isToday: isToday(date),
        isCurrentMonth: true,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    setCalendarDays(days);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getDayOfWeek = (dayIndex: number) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[dayIndex];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: theme.text }]}>
          {currentDate.toLocaleDateString('ru-RU', { 
            month: 'long', 
            year: 'numeric' 
          }).toUpperCase()}
        </Text>
      </View>

      {/* Дни недели */}
      <View style={styles.weekDays}>
        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
          <View key={dayIndex} style={styles.weekDay}>
            <Text style={[
              styles.weekDayText,
              { color: theme.text },
              (dayIndex === 0 || dayIndex === 6) && styles.weekendText
            ]}>
              {getDayOfWeek(dayIndex)}
            </Text>
          </View>
        ))}
      </View>

      {/* Календарь */}
      <ScrollView style={styles.calendar}>
        <View style={styles.daysGrid}>
          {calendarDays.map((dayInfo, index) => (
            <View 
              key={index} 
              style={[
                styles.dayCell,
                dayInfo.isWeekend && styles.weekendCell,
                !dayInfo.isCurrentMonth && styles.otherMonthCell
              ]}
            >
              {dayInfo.day && (
                <View style={[
                  styles.dayContent,
                  dayInfo.isToday && [styles.todayCell, { backgroundColor: theme.tint }]
                ]}>
                  <Text style={[
                    styles.dayText,
                    { color: theme.text },
                    dayInfo.isToday && styles.todayText,
                    dayInfo.isWeekend && styles.weekendDayText
                  ]}>
                    {dayInfo.day}
                  </Text>
                  {dayInfo.isToday && (
                    <View style={[styles.todayDot, { backgroundColor: theme.tint }]} />
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Информация о сегодняшнем дне */}
      <View style={[styles.todayInfo, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.todayLabel, { color: theme.text }]}>СЕГОДНЯ</Text>
        <Text style={[styles.todayDate, { color: theme.tint }]}>
          {new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  weekendText: {
    color: '#ff6b6b',
  },
  calendar: {
    flex: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  dayCell: {
    width: '14.28%', // 100% / 7 дней
    aspectRatio: 1,
    padding: 4,
  },
  weekendCell: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  todayCell: {
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  weekendDayText: {
    color: '#ff6b6b',
  },
  todayDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  todayInfo: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    opacity: 0.7,
  },
  todayDate: {
    fontSize: 16,
    fontWeight: '600',
  },
}
);