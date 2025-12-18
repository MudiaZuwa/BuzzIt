import React, { useState } from "react";
import {
  Modal,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  useToast,
  Icon,
  IconButton,
  Pressable,
  Box,
} from "native-base";
import { Input } from "./PatchedInput";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { useProfile } from "../context/ProfileContext";

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigation = useNavigation();
  const { openProfileModal } = useProfile();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast.show({ description: "Please fill all fields" });
      return;
    }

    if (!isLogin && !name.trim()) {
      toast.show({ description: "Please enter your name" });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login
        await auth.signInWithEmailAndPassword(email, password);
        toast.show({ description: "Login successful!" });
        if (onLoginSuccess) onLoginSuccess();
        handleClose();
      } else {
        // Register
        const userCredential = await auth.createUserWithEmailAndPassword(
          email,
          password
        );
        const user = userCredential.user;

        await database.ref(`UsersDetails/${user.uid}`).set({
          name: name,
          email: email,
          date: Date.now(),
          profilePhoto:
            "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(name) +
            "&size=150&background=0d7059&color=fff",
        });

        toast.show({ description: "Account created successfully!" });
        if (onLoginSuccess) onLoginSuccess();
        handleClose();

        // Trigger profile completion modal after registration
        // Small delay to ensure modal closes first
        setTimeout(() => {
          openProfileModal();
        }, 500);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.show({ description: error.message || "Authentication failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>{isLogin ? "Login" : "Sign Up"}</Modal.Header>
        <Modal.Body>
          <VStack space={4}>
            {/* Tabs */}
            <HStack mb={4} bg="gray.100" p={1} rounded="md">
              <Pressable
                flex={1}
                py={2}
                bg={isLogin ? "white" : "transparent"}
                rounded="sm"
                shadow={isLogin ? 1 : 0}
                onPress={() => setIsLogin(true)}
              >
                <Text
                  textAlign="center"
                  fontWeight={isLogin ? "bold" : "normal"}
                  color={isLogin ? "primary.500" : "gray.500"}
                >
                  Login
                </Text>
              </Pressable>
              <Pressable
                flex={1}
                py={2}
                bg={!isLogin ? "white" : "transparent"}
                rounded="sm"
                shadow={!isLogin ? 1 : 0}
                onPress={() => setIsLogin(false)}
              >
                <Text
                  textAlign="center"
                  fontWeight={!isLogin ? "bold" : "normal"}
                  color={!isLogin ? "primary.500" : "gray.500"}
                >
                  Sign Up
                </Text>
              </Pressable>
            </HStack>

            {!isLogin && (
              <Input
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                size="lg"
                InputLeftElement={
                  <Icon
                    as={MaterialCommunityIcons}
                    name="account"
                    size={5}
                    ml={2}
                    color="gray.400"
                  />
                }
              />
            )}

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              size="lg"
              InputLeftElement={
                <Icon
                  as={MaterialCommunityIcons}
                  name="email"
                  size={5}
                  ml={2}
                  color="gray.400"
                />
              }
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              type={showPassword ? "text" : "password"}
              size="lg"
              InputLeftElement={
                <Icon
                  as={MaterialCommunityIcons}
                  name="lock"
                  size={5}
                  ml={2}
                  color="gray.400"
                />
              }
              InputRightElement={
                <IconButton
                  icon={
                    <Icon
                      as={MaterialCommunityIcons}
                      name={showPassword ? "eye" : "eye-off"}
                      size={5}
                      color="gray.400"
                    />
                  }
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              onPress={handleAuth}
              isLoading={loading}
              isDisabled={loading}
              size="lg"
              mt={2}
            >
              {isLogin ? "Login" : "Sign Up"}
            </Button>

            <HStack alignItems="center" my={2}>
              <Box flex={1} h="1px" bg="gray.300" />
              <Text mx={2} color="gray.400">
                or
              </Text>
              <Box flex={1} h="1px" bg="gray.300" />
            </HStack>

            <Button
              variant="outline"
              colorScheme="coolGray"
              leftIcon={
                <Icon as={MaterialCommunityIcons} name="google" size="sm" />
              }
              onPress={() =>
                toast.show({ description: "Google Sign In coming soon" })
              }
              size="lg"
            >
              Sign in with Google
            </Button>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default AuthModal;
