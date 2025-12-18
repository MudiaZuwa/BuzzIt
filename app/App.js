import React from "react";

import { NativeBaseProvider } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import theme from "./src/theme";
import { ProfileProvider } from "./src/context/ProfileContext";

const config = {
  suppressColorAccessibilityWarning: true,
};

const App = () => {
  return (
    <NativeBaseProvider theme={theme} config={config}>
      <ProfileProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ProfileProvider>
    </NativeBaseProvider>
  );
};

export default App;
