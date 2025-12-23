import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorMode } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "@buzzit_theme";

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { colorMode, setColorMode, toggleColorMode } = useColorMode();
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setColorMode(savedTheme);
        } else {
          // Use system preference if no saved preference
          setColorMode(systemColorScheme || "light");
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference when it changes
  const setTheme = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setColorMode(mode);
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  const toggleTheme = async () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    await setTheme(newMode);
  };

  const useSystemTheme = async () => {
    try {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      setColorMode(systemColorScheme || "light");
    } catch (error) {
      console.log("Error removing theme preference:", error);
    }
  };

  const value = {
    isDark: colorMode === "dark",
    colorMode,
    setTheme,
    toggleTheme,
    useSystemTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
