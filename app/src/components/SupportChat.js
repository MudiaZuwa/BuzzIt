import React, { useState, useRef, useEffect } from "react";
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
import { Platform, Keyboard } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";

// TODO: Replace with your N8N webhook URL
const WEBHOOK_URL =
  process.env.EXPO_PUBLIC_SUPPORT_WEBHOOK_URL ||
  "https://your-n8n-webhook.com/webhook/support";

const SupportChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi! I'm BuzzIt Support Bot. How can I help you today?",
      sender: "bot",
      timestamp: Date.now(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const userMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setSending(true);
    Keyboard.dismiss();

    try {
      const response = await axios.post(WEBHOOK_URL, {
        message: userMessage.content,
        sessionId: `support_${Date.now()}`,
      });

      const botResponse = {
        id: Date.now() + 1,
        content:
          response.data?.response ||
          response.data?.message ||
          "Thanks for your message! Our team will get back to you soon.",
        sender: "bot",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending to support bot:", error);
      const errorMessage = {
        id: Date.now() + 1,
        content:
          "Sorry, I'm having trouble connecting. Please try again later or email us at support@buzzit.com",
        sender: "bot",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
          <Pressable onPress={onClose} mr={3}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </Pressable>

          <HStack alignItems="center" space={3} flex={1}>
            <Avatar
              size="sm"
              source={{
                uri: "https://ui-avatars.com/api/?name=Support&background=0d7059&color=fff&size=40",
              }}
              bg="primary.600"
            >
              S
            </Avatar>
            <VStack>
              <Text fontWeight="600" fontSize="md">
                BuzzIt Support
              </Text>
              <Text fontSize="xs" color="gray.500">
                Usually responds instantly
              </Text>
            </VStack>
          </HStack>
        </HStack>

        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          flex={1}
          bg="gray.50"
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }}
        >
          {messages.map((msg) => (
            <Box
              key={msg.id}
              alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
              maxWidth="80%"
              mb={3}
            >
              <Box
                bg={msg.sender === "user" ? "primary.600" : "white"}
                px={4}
                py={3}
                borderRadius="lg"
                shadow={1}
              >
                <Text
                  color={msg.sender === "user" ? "white" : "gray.800"}
                  fontSize="sm"
                >
                  {msg.content}
                </Text>
              </Box>
              <Text
                fontSize="xs"
                color="gray.500"
                mt={1}
                alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
              >
                {formatTime(msg.timestamp)}
              </Text>
            </Box>
          ))}

          {sending && (
            <Box alignSelf="flex-start" maxWidth="80%" mb={3}>
              <Box bg="white" px={4} py={3} borderRadius="lg" shadow={1}>
                <HStack alignItems="center" space={2}>
                  <Spinner size="sm" color="primary.600" />
                  <Text color="gray.500" fontSize="sm">
                    Thinking...
                  </Text>
                </HStack>
              </Box>
            </Box>
          )}
        </ScrollView>

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
          <Input
            flex={1}
            placeholder="Type your question..."
            value={newMessage}
            onChangeText={setNewMessage}
            borderRadius="full"
            bg="gray.100"
            borderWidth={0}
            py={2}
            px={4}
            fontSize="sm"
            mr={2}
            isDisabled={sending}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          <IconButton
            icon={
              sending ? (
                <Spinner size="sm" color="white" />
              ) : (
                <MaterialCommunityIcons name="send" size={20} color="white" />
              )
            }
            bg="primary.600"
            borderRadius="full"
            size="md"
            onPress={handleSendMessage}
            isDisabled={!newMessage.trim() || sending}
            _pressed={{ bg: "primary.700" }}
          />
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );
};

export default SupportChat;
