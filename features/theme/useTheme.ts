import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_KEY = 'app_theme';

export function useTheme() {
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<'light' | 'dark'>(systemTheme);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(savedTheme => {
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
      else setTheme(systemTheme);
    });
  }, [systemTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  return { theme, toggleTheme };
}