import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  dayInfo?: {
    day?: number;
    date?: string;
    isToday?: boolean;
    isCurrentMonth?: boolean;
    isWeekend?: boolean;
  };
  theme: any;
};

export default function CalendarCell({ dayInfo, theme }: Props) {
  if (!dayInfo) return <View style={styles.dayCell} />;

  // Для темной темы: кружок tint, число черное
  // Для светлой темы: кружок tint, число белое
  const todayTextColor =
    dayInfo.isToday && theme.background === '#121212'
      ? '#000'
      : dayInfo.isToday
      ? '#fff'
      : theme.text;

  return (
    <View
      style={[
        styles.dayCell,
        dayInfo.isWeekend && styles.weekendCell,
        !dayInfo.isCurrentMonth && styles.otherMonthCell,
      ]}
    >
      {dayInfo.day && (
        <View
          style={[
            styles.dayContent,
            dayInfo.isToday && [
              styles.todayCell,
              { backgroundColor: theme.tint },
            ],
          ]}
        >
          <Text
            style={[
              styles.dayText,
              { color: todayTextColor },
              dayInfo.isToday && styles.todayText,
              dayInfo.isWeekend && styles.weekendDayText,
            ]}
          >
            {dayInfo.day}
          </Text>
          {dayInfo.isToday && (
            <View
              style={[styles.todayDot, { backgroundColor: theme.tint }]}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dayCell: { width: '14.28%', aspectRatio: 1, padding: 4 },
  weekendCell: { backgroundColor: 'rgba(255, 107, 107, 0.1)' },
  otherMonthCell: { opacity: 0.3 },
  dayContent: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  todayCell: { borderRadius: 20 },
  dayText: { fontSize: 16, fontWeight: '500' },
  todayText: { fontWeight: 'bold' },
  weekendDayText: { color: '#ff6b6b' },
  todayDot: { position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2 },
});