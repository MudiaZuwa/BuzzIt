import React from "react";
import { Box, HStack, IconButton, Text } from "native-base";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GameWebView = ({ route }) => {
  const navigation = useNavigation();
  const { gameUrl, gameName } = route?.params || {};

  return (
    <Box flex={1} safeArea>
      {/* Header */}
      <HStack
        bg="primary.500"
        px={2}
        py={3}
        alignItems="center"
        space={3}
        shadow={2}
      >
        <IconButton
          icon={
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          }
          onPress={() => navigation.goBack()}
        />
        <Text color="white" fontSize="lg" fontWeight="bold">
          {gameName || "Game"}
        </Text>
      </HStack>

      {/* WebView for Game */}
      <WebView
        source={{ uri: gameUrl }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </Box>
  );
};

export default GameWebView;
