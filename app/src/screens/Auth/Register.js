import React, { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Text,
  Heading,
  HStack,
  useToast,
  KeyboardAvoidingView,
  ScrollView,
} from "native-base";
import { Platform, TextInput, StyleSheet } from "react-native";

import { auth, database } from "../../config/firebase";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.show({ description: "Please fill all fields" });
      return;
    }

    if (password !== confirmPassword) {
      toast.show({ description: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      toast.show({ description: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Create user profile in database
      const userRef = database.ref(`UsersDetails/${uid}`);
      await userRef.set({
        name,
        email,
        profilePhoto: null,
        bio: "",
        joinedDate: Date.now(),
        friends: [],
      });

      toast.show({ description: "Account created successfully!" });
    } catch (error) {
      console.error("Registration error:", error);
      toast.show({ description: error.message || "Registration failed" });
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
        <VStack flex={1} px={6} py={12} space={6}>
          {/* Header */}
          <Box alignItems="center" mb={4}>
            <Heading size="2xl" color="primary.500">
              Join BuzzIt
            </Heading>
            <Text color="gray.500" fontSize="md">
              Create your account
            </Text>
          </Box>

          {/* Registration Form */}
          <VStack space={4}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#a0a0a0"
              value={name}
              onChangeText={setName}
            />
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
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#a0a0a0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              onPress={handleRegister}
              isLoading={loading}
              isDisabled={loading}
              size="lg"
              mt={4}
            >
              Create Account
            </Button>

            <HStack justifyContent="center" mt={4}>
              <Text color="gray.600">Already have an account? </Text>
              <Button
                variant="link"
                colorScheme="primary"
                onPress={() => navigation.navigate("Login")}
              >
                Login
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

export default Register;
