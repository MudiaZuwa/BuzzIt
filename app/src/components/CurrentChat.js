import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Avatar,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Spinner,
  Icon,
} from "native-base";
import { Input } from "./PatchedInput";
import { Platform, Keyboard, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ChatMessage from "./ChatMessage";
import sendMessage from "../functions/sendMessage";
import fetchDataFromNode from "../functions/fetchDataFromNode";
import AudioCallModal from "./AudioCallModal";
import VideoCallModal from "./VideoCallModal";
import GameListModal from "./GameListModal";
import GroupChatModal from "./GroupChatModal";
import * as ImagePicker from "expo-image-picker";
import handleFileUpload from "../functions/handleFileUpload";

const CurrentChat = ({
  chatId,
  uid,
  messages,
  recipientDetails,
  isLoading,
  friendsList = [],
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showAudioCallModal, setShowAudioCallModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showGameListModal, setShowGameListModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();

  // Default profile images
  const defaultProfilePhoto =
    "https://ui-avatars.com/api/?name=User&size=50&background=cccccc&color=666666";
  const defaultGroupPhoto =
    "https://ui-avatars.com/api/?name=Group&size=50&background=cccccc&color=666666";

  const isGroupChat = recipientDetails?.isGroupChat || false;
  const chatProfilePhoto = recipientDetails?.profilePhoto
    ? recipientDetails.profilePhoto
    : isGroupChat
    ? defaultGroupPhoto
    : defaultProfilePhoto;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedMedia(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedMedia) || sendingMessage || isUploading)
      return;

    // Guardrail: Check if recipient has a name
    if (
      !recipientDetails ||
      !recipientDetails.name ||
      recipientDetails.name === ""
    ) {
      Alert.alert(
        "Cannot Send",
        "You cannot message this user because their profile is incomplete."
      );
      return;
    }

    setSendingMessage(true);
    Keyboard.dismiss();

    try {
      const userDetails = await fetchDataFromNode(`UsersDetails/${uid}`);
      if (!userDetails || !userDetails.name) {
        Alert.alert(
          "Incomplete Profile",
          "Please complete your profile (set a name) in settings before sending messages."
        );
        setSendingMessage(false);
        return;
      }

      let mediaUrl = null;
      let messageType = "text";

      if (selectedMedia) {
        setIsUploading(true);
        try {
          // Upload media
          const uploadResult = await handleFileUpload(
            [selectedMedia],
            "chat_files",
            uid
          );

          if (uploadResult && uploadResult.length > 0) {
            mediaUrl = uploadResult[0];
            messageType = "media"; // Or determine based on file type if needed
          }
        } catch (uploadError) {
          console.error("Upload failed", uploadError);
          Alert.alert("Upload Failed", "Failed to upload media");
          setIsUploading(false);
          setSendingMessage(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      await sendMessage({
        currentUserId: uid,
        recipientUserId: recipientDetails?.id,
        chatId,
        messageContent: newMessage.trim(),
        messageType,
        mediaUrl: mediaUrl,
        isGroupChat,
        groupParticipants: recipientDetails?.members || {},
      });
      setNewMessage("");
      setSelectedMedia(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const groupMessagesByDate = (msgs) => {
    return msgs.reduce((acc, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(msg);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  if (!recipientDetails) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="gray.50">
        <Spinner size="lg" color="primary.600" />
        <Text mt={4} color="gray.500">
          Loading chat...
        </Text>
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Box flex={1} bg="white">
        {/* Chat Header */}
        <HStack
          bg="white"
          px={4}
          py={3}
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="gray.100"
          safeAreaTop
        >
          <Pressable onPress={() => navigation.goBack()} mr={3}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </Pressable>

          <Pressable
            flex={1}
            onPress={() => {
              if (!isGroupChat && recipientDetails?.id) {
                navigation.navigate("UserProfile", {
                  userId: recipientDetails.id,
                });
              }
            }}
          >
            <HStack alignItems="center" space={3}>
              <Avatar
                size="sm"
                source={{ uri: chatProfilePhoto }}
                bg="gray.300"
              >
                {recipientDetails?.name?.charAt(0).toUpperCase() || "?"}
              </Avatar>
              <Text fontWeight="600" fontSize="md" numberOfLines={1}>
                {recipientDetails?.name || "Unknown"}
              </Text>
            </HStack>
          </Pressable>

          {/* Call Buttons (only for 1:1 chats) */}
          {!isGroupChat && (
            <HStack space={2}>
              {/* Game invite button */}
              <IconButton
                icon={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="gamepad-variant"
                    size="sm"
                    color="gray.600"
                  />
                }
                variant="ghost"
                borderRadius="full"
                onPress={() => setShowGameListModal(true)}
              />
              <IconButton
                icon={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="phone"
                    size="sm"
                    color="gray.600"
                  />
                }
                variant="ghost"
                borderRadius="full"
                onPress={() => setShowAudioCallModal(true)}
              />
              <IconButton
                icon={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="video"
                    size="sm"
                    color="gray.600"
                  />
                }
                variant="ghost"
                borderRadius="full"
                onPress={() => setShowVideoCallModal(true)}
              />
            </HStack>
          )}
          {/* Group info button (only for group chats) */}
          {isGroupChat && (
            <IconButton
              icon={
                <Icon
                  as={MaterialCommunityIcons}
                  name="information"
                  size="sm"
                  color="gray.600"
                />
              }
              variant="ghost"
              borderRadius="full"
              onPress={() => setShowGroupModal(true)}
            />
          )}
        </HStack>

        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          flex={1}
          bg="gray.50"
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }}
        >
          {/* Recipient Info Header */}
          <VStack alignItems="center" py={6} mb={4}>
            <Avatar size="xl" source={{ uri: chatProfilePhoto }} bg="gray.300">
              {recipientDetails?.name?.charAt(0).toUpperCase() || "?"}
            </Avatar>
            <Text fontWeight="bold" fontSize="lg" mt={3}>
              {recipientDetails?.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {isGroupChat ? "Created: " : "Joined: "}
              {recipientDetails?.date
                ? new Date(recipientDetails.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown"}
            </Text>
          </VStack>

          {/* Messages by Date */}
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <VStack key={date}>
              {/* Date Label */}
              <Box alignItems="center" my={3}>
                <Box bg="gray.200" px={3} py={1} borderRadius="full">
                  <Text fontSize="xs" color="gray.600">
                    {formatDate(date)}
                  </Text>
                </Box>
              </Box>

              {/* Messages for this date */}
              {msgs.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  currentUser={uid}
                  isGroupChat={isGroupChat}
                />
              ))}
            </VStack>
          ))}

          {isLoading && (
            <Box py={4} alignItems="center">
              <Spinner size="sm" />
            </Box>
          )}
        </ScrollView>

        {/* Media Preview Area */}
        {selectedMedia && (
          <Box
            px={4}
            py={2}
            bg="gray.100"
            borderTopWidth={1}
            borderColor="gray.200"
          >
            <Box position="relative" width={20} height={20}>
              <Avatar
                source={{ uri: selectedMedia.uri }}
                width="100%"
                height="100%"
                rounded="md"
              />
              <IconButton
                position="absolute"
                top={-8}
                right={-8}
                size="sm"
                variant="solid"
                bg="red.500"
                rounded="full"
                _icon={{
                  as: MaterialCommunityIcons,
                  name: "close",
                  size: "xs",
                }}
                onPress={handleRemoveMedia}
              />
            </Box>
          </Box>
        )}

        {/* Message Input */}
        <HStack
          bg="white"
          px={3}
          py={2}
          alignItems="center"
          borderTopWidth={1}
          borderTopColor="gray.100"
          safeAreaBottom
        >
          <IconButton
            icon={
              <MaterialCommunityIcons name="paperclip" size={24} color="gray" />
            }
            onPress={handlePickImage}
            variant="ghost"
            mr={1}
          />
          <Input
            flex={1}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            borderRadius="full"
            bg="gray.100"
            borderWidth={0}
            py={2}
            px={4}
            fontSize="sm"
            mr={2}
            isDisabled={sendingMessage || isUploading}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <IconButton
            icon={
              sendingMessage || isUploading ? (
                <Spinner size="sm" color="white" />
              ) : (
                <MaterialCommunityIcons name="send" size={20} color="white" />
              )
            }
            bg="primary.600"
            borderRadius="full"
            size="md"
            onPress={handleSendMessage}
            isDisabled={
              (!newMessage.trim() && !selectedMedia) ||
              sendingMessage ||
              isUploading
            }
            _pressed={{ bg: "primary.700" }}
          />
        </HStack>
      </Box>

      {/* Call Modals */}
      <AudioCallModal
        isOpen={showAudioCallModal}
        onClose={() => setShowAudioCallModal(false)}
        uid={uid}
        recipientId={recipientDetails?.id}
        caller="user"
        recipientDetails={recipientDetails}
      />
      <VideoCallModal
        isOpen={showVideoCallModal}
        onClose={() => setShowVideoCallModal(false)}
        uid={uid}
        recipientId={recipientDetails?.id}
        caller="user"
        recipientDetails={recipientDetails}
      />

      {/* Game List Modal (for 1:1 chats) */}
      <GameListModal
        isOpen={showGameListModal}
        onClose={() => setShowGameListModal(false)}
        uid={uid}
        friendId={recipientDetails?.id}
      />

      {/* Group Chat Modal (for group chats) */}
      <GroupChatModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        uid={uid}
        friendsList={friendsList}
        groupDetails={recipientDetails}
      />
    </KeyboardAvoidingView>
  );
};

export default CurrentChat;
