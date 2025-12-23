import React from "react";
import { NativeBaseProvider, ColorMode, StorageManager } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./src/navigation/AppNavigator";
import theme from "./src/theme";
import { ProfileProvider } from "./src/context/ProfileContext";

const config = {
  suppressColorAccessibilityWarning: true,
};

// Color mode storage manager for persistence
const colorModeManager = {
  get: async () => {
    try {
      const val = await AsyncStorage.getItem("@buzzit_color_mode");
      return val === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  },
  set: async (value) => {
    try {
      await AsyncStorage.setItem("@buzzit_color_mode", value);
    } catch (e) {
      console.log("Error saving color mode:", e);
    }
  },
};

const App = () => {
  return (
    <NativeBaseProvider
      theme={theme}
      config={config}
      colorModeManager={colorModeManager}
    >
      <ProfileProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ProfileProvider>
    </NativeBaseProvider>
  );
};

export default App;
