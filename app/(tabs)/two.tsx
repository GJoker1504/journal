import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import CalendarCell from '@/components/CalendarCell';
import { useThemeContext } from '@/shared/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function CalendarScreen() {
  const { theme, toggleTheme } = useThemeContext();
  const colorTheme = Colors[theme];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);

  useEffect(() => {
    generateCalendar();
  }, []);

  const generateCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isToday: false, isCurrentMonth: false });
    }
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
    <View style={[styles.container, { backgroundColor: colorTheme.background }]}>
      <Stack.Screen
        options={{
          title: 'Календарь',
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
      <View style={styles.header}>
        <Text style={[styles.monthTitle, { color: colorTheme.text }]}>
          {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase()}
        </Text>
      </View>
      <View style={styles.weekDays}>
        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
          <View key={dayIndex} style={styles.weekDay}>
            <Text style={[
              styles.weekDayText,
              { color: colorTheme.text },
              (dayIndex === 0 || dayIndex === 6) && styles.weekendText
            ]}>
              {getDayOfWeek(dayIndex)}
            </Text>
          </View>
        ))}
      </View>
      <ScrollView style={styles.calendar}>
        <View style={styles.daysGrid}>
          {calendarDays.map((dayInfo, index) => (
            <CalendarCell key={index} dayInfo={dayInfo} theme={colorTheme} />
          ))}
        </View>
      </ScrollView>
      <View style={[styles.todayInfo, { backgroundColor: colorTheme.cardBackground }]}>
        <Text style={[styles.todayLabel, { color: colorTheme.text }]}>СЕГОДНЯ</Text>
        <Text style={[styles.todayDate, { color: colorTheme.tint }]}>
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
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  monthTitle: { fontSize: 20, fontWeight: 'bold' },
  weekDays: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  weekDay: { flex: 1, alignItems: 'center' },
  weekDayText: { fontSize: 12, fontWeight: '500' },
  weekendText: { color: '#ff6b6b' },
  calendar: { flex: 1 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  todayInfo: { padding: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0', alignItems: 'center' },
  todayLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, opacity: 0.7 },
  todayDate: { fontSize: 16, fontWeight: '600' },
  themeButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});