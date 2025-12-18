import React, { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Image,
  Pressable,
  Modal,
} from "native-base";
import { Linking } from "react-native";
import { Video, ResizeMode } from "expo-av";

const ChatMessage = ({ message, currentUser, isGroupChat }) => {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const isSender = message.sender === currentUser;

  // Default profile image
  const defaultProfilePhoto =
    "https://ui-avatars.com/api/?name=User&size=40&background=cccccc&color=666666";

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ["mp4", "webm", "ogg", "mov"];
    const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
    return videoExtensions.includes(extension);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessageText = (text) => {
    if (!text) return null;

    // Simple URL detection
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <Text color={isSender ? "white" : "gray.800"} fontSize="sm">
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <Text
                key={index}
                color={isSender ? "blue.200" : "blue.600"}
                underline
                onPress={() => Linking.openURL(part)}
              >
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <HStack justifyContent={isSender ? "flex-end" : "flex-start"} mb={2} px={3}>
      {/* Group chat sender avatar */}
      {!isSender && isGroupChat && (
        <Image
          source={{ uri: message.senderProfilePhoto || defaultProfilePhoto }}
          alt="sender"
          size="8"
          rounded="full"
          mr={2}
          mt={1}
        />
      )}

      <VStack maxWidth="75%">
        {/* Group chat sender name */}
        {!isSender && isGroupChat && (
          <Text fontSize="xs" color="gray.500" mb={1}>
            {message.senderName || "Unknown"}
          </Text>
        )}

        <Box
          bg={isSender ? "primary.600" : "gray.100"}
          px={3}
          py={2}
          borderRadius="lg"
          borderTopRightRadius={isSender ? "sm" : "lg"}
          borderTopLeftRadius={isSender ? "lg" : "sm"}
        >
          {/* Media content */}
          {message.media && (
            <Pressable
              onPress={() => setShowMediaModal(true)}
              mb={message.message ? 2 : 0}
            >
              {isVideo(message.media) ? (
                <Box position="relative" borderRadius="md" overflow="hidden">
                  <Video
                    source={{ uri: message.media }}
                    style={{ width: 200, height: 150 }}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isLooping={false}
                    isMuted
                  />
                  <Box
                    position="absolute"
                    bottom={2}
                    left={2}
                    bg="rgba(0,0,0,0.5)"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    <Text color="white" fontSize="xs">
                      ▶
                    </Text>
                  </Box>
                </Box>
              ) : (
                <Image
                  source={{ uri: message.media }}
                  alt="sent media"
                  width={200}
                  height={150}
                  borderRadius="md"
                  resizeMode="cover"
                />
              )}
            </Pressable>
          )}

          {/* Text content */}
          {message.message && renderMessageText(message.message)}

          {/* Timestamp */}
          <Text
            fontSize="2xs"
            color={isSender ? "gray.300" : "gray.400"}
            textAlign="right"
            mt={1}
          >
            {formatTime(message.timestamp)}
          </Text>
        </Box>
      </VStack>

      {/* Media Modal */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        size="full"
      >
        <Modal.Content bg="black" maxWidth="100%" maxHeight="100%">
          <Modal.CloseButton _icon={{ color: "white" }} />
          <Modal.Body p={0} alignItems="center" justifyContent="center">
            {message.media &&
              (isVideo(message.media) ? (
                <Video
                  source={{ uri: message.media }}
                  style={{ width: "100%", height: 400 }}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay
                />
              ) : (
                <Image
                  source={{ uri: message.media }}
                  alt="full media"
                  width="100%"
                  height={400}
                  resizeMode="contain"
                />
              ))}
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </HStack>
  );
};

export default ChatMessage;
