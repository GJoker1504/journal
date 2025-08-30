import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

type Props = {
  item: {
    id: string;
    date: string;
    dayOfWeek: string;
    isToday: boolean;
  };
  taskTitles: string[];
  totalNotes: number;
  theme: any;
};

export default function DayCard({ item, taskTitles, totalNotes, theme }: Props) {
  const hasNotes = taskTitles.length > 0;
  return (
    <Link href={`/${item.date}`} asChild>
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
          { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }
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
}

const styles = StyleSheet.create({
  item: { marginBottom: 16 },
  todayItem: { borderRadius: 12, padding: 8 },
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayOfWeek: { fontSize: 14, fontWeight: '500' },
  dateHeader: { fontSize: 16, fontWeight: '600' },
  todayText: { fontWeight: '700' },
  taskContainer: { padding: 12, borderRadius: 8, borderWidth: 1 },
  tasksList: { gap: 8 },
  taskItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  taskTitle: { fontSize: 14, flex: 1 },
  taskText: { fontSize: 14, textAlign: 'center' },
  moreTasks: { fontSize: 12, marginTop: 4, textAlign: 'center' },
});