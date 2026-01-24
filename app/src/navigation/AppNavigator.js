import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon, Box } from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useVerifyUser from "../hooks/useVerifyUser";

// Import Screens
import HomeScreen from "../screens/Home";
import ProfileScreen from "../screens/Profile";
import PostDetailsScreen from "../screens/PostDetails";
import MessagesScreen from "../screens/Messages";
import ChatScreen from "../screens/Chat";
import NotificationsScreen from "../screens/Notifications";
import SearchScreen from "../screens/Search";
import GameScreen from "../screens/Game";
import GameWebViewScreen from "../screens/GameWebView";
import SettingsScreen from "../screens/Settings";
import LoginScreen from "../screens/Auth/Login";
import RegisterScreen from "../screens/Auth/Register";

// Import Components
import IncomingCallModal from "../components/IncomingCallModal";
import NotificationHandler from "../components/NotificationHandler";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main screens
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "SearchTab") {
            iconName = focused ? "magnify" : "magnify";
          } else if (route.name === "GamesTab") {
            iconName = focused ? "gamepad-variant" : "gamepad-variant-outline";
          } else if (route.name === "MessagesTab") {
            iconName = focused ? "message" : "message-outline";
          } else if (route.name === "NotificationsTab") {
            iconName = focused ? "bell" : "bell-outline";
          }

          return (
            <Icon
              as={MaterialCommunityIcons}
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#0d7059",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{ title: "Search" }}
      />
      <Tab.Screen
        name="GamesTab"
        component={GameScreen}
        options={{ title: "Games" }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesScreen}
        options={{ title: "Messages" }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isPending, uid, loggedIn } = useVerifyUser();

  if (isPending) {
    return null; // or a loading screen
  }

  return (
    <Box flex={1}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
        <Stack.Screen name="UserProfile" component={ProfileScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Games" component={GameScreen} />
        <Stack.Screen name="GameWebView" component={GameWebViewScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>

      {/* Global Incoming Call Handler */}
      {loggedIn && uid && <IncomingCallModal uid={uid} />}

      {/* Global Notification Handler */}
      {loggedIn && uid && <NotificationHandler uid={uid} />}
    </Box>
  );
};

export default AppNavigator;
