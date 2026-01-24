import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  useToast,
  KeyboardAvoidingView,
  ScrollView,
} from "native-base";
import { Platform, TextInput, StyleSheet } from "react-native";
import { auth } from "../../config/firebase";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.show({ description: "Please fill all fields" });
      return;
    }

    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      toast.show({ description: "Login successful!" });
    } catch (error) {
      console.error("Login error:", error);
      toast.show({ description: error.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      flex={1}
    >
      <ScrollView flex={1} bg="white">
        <VStack flex={1} px={6} py={12} space={6} justifyContent="center">
          {/* Logo */}
          <Box alignItems="center" mb={8}>
            <Heading size="2xl" color="primary.500">
              BuzzIt
            </Heading>
            <Text color="gray.500" fontSize="md">
              Connect with friends
            </Text>
          </Box>

          {/* Login Form */}
          <VStack space={4}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#a0a0a0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#a0a0a0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              onPress={handleLogin}
              isLoading={loading}
              isDisabled={loading}
              size="lg"
              mt={4}
            >
              Login
            </Button>

            <HStack justifyContent="center" mt={4}>
              <Text color="gray.600">Don't have an account? </Text>
              <Button
                variant="link"
                colorScheme="primary"
                onPress={() => navigation.navigate("Register")}
              >
                Sign Up
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
});

export default Login;
