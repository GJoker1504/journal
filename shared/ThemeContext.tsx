import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

const THEME_KEY = 'app_theme';

const ThemeContext = createContext<{
  theme: ThemeType;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<ThemeType>(systemTheme);

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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};