import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  ScrollView,
  Icon,
  Modal,
  Button,
  Heading,
  Divider,
  Switch,
  useColorMode,
} from "native-base";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SupportChat from "../components/SupportChat";

const APP_VERSION = "1.0.0";

const Settings = () => {
  const navigation = useNavigation();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const SettingsItem = ({
    icon,
    label,
    value,
    onPress,
    showChevron = true,
    rightElement,
  }) => (
    <Pressable onPress={onPress} disabled={!onPress}>
      {({ isPressed }) => (
        <HStack
          bg={
            isPressed
              ? isDark
                ? "dark.700"
                : "gray.50"
              : isDark
              ? "dark.800"
              : "white"
          }
          px={4}
          py={4}
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack alignItems="center" space={3}>
            <Icon
              as={MaterialCommunityIcons}
              name={icon}
              size="md"
              color={isDark ? "gray.400" : "gray.600"}
            />
            <Text fontSize="md" color={isDark ? "white" : "gray.800"}>
              {label}
            </Text>
          </HStack>
          <HStack alignItems="center" space={2}>
            {value && (
              <Text color={isDark ? "gray.400" : "gray.500"} fontSize="sm">
                {value}
              </Text>
            )}
            {rightElement}
            {showChevron && !rightElement && (
              <Icon
                as={MaterialCommunityIcons}
                name="chevron-right"
                size="md"
                color={isDark ? "gray.500" : "gray.400"}
              />
            )}
          </HStack>
        </HStack>
      )}
    </Pressable>
  );

  const SectionHeader = ({ title }) => (
    <Box px={4} py={2} bg={isDark ? "dark.900" : "gray.100"}>
      <Text
        fontSize="sm"
        fontWeight="600"
        color={isDark ? "gray.400" : "gray.600"}
        textTransform="uppercase"
      >
        {title}
      </Text>
    </Box>
  );

  return (
    <Box flex={1} bg={isDark ? "dark.900" : "gray.50"} safeArea>
      {/* Header */}
      <HStack
        bg={isDark ? "dark.800" : "white"}
        px={4}
        py={3}
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor={isDark ? "dark.700" : "gray.100"}
      >
        <Pressable onPress={() => navigation.goBack()} mr={3}>
          <Icon
            as={MaterialCommunityIcons}
            name="arrow-left"
            size="md"
            color={isDark ? "white" : "gray.700"}
          />
        </Pressable>
        <Heading size="md" color={isDark ? "white" : "gray.800"}>
          Settings
        </Heading>
      </HStack>

      <ScrollView>
        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <VStack
          bg={isDark ? "dark.800" : "white"}
          divider={<Divider bg={isDark ? "dark.700" : "gray.100"} />}
        >
          <SettingsItem
            icon={isDark ? "weather-night" : "white-balance-sunny"}
            label="Dark Mode"
            showChevron={false}
            rightElement={
              <Switch
                isChecked={isDark}
                onToggle={toggleColorMode}
                colorScheme="primary"
              />
            }
          />
        </VStack>

        {/* App Information */}
        <SectionHeader title="App Information" />
        <VStack
          bg={isDark ? "dark.800" : "white"}
          divider={<Divider bg={isDark ? "dark.700" : "gray.100"} />}
        >
          <SettingsItem
            icon="information-outline"
            label="Version"
            value={APP_VERSION}
            showChevron={false}
          />
          <SettingsItem
            icon="help-circle-outline"
            label="About BuzzIt"
            onPress={() => setShowAbout(true)}
          />
        </VStack>

        {/* Legal */}
        <SectionHeader title="Legal" />
        <VStack
          bg={isDark ? "dark.800" : "white"}
          divider={<Divider bg={isDark ? "dark.700" : "gray.100"} />}
        >
          <SettingsItem
            icon="file-document-outline"
            label="Terms of Service"
            onPress={() => setShowTerms(true)}
          />
          <SettingsItem
            icon="shield-lock-outline"
            label="Privacy Policy"
            onPress={() => setShowPrivacy(true)}
          />
        </VStack>

        {/* Help */}
        <SectionHeader title="Help" />
        <VStack
          bg={isDark ? "dark.800" : "white"}
          divider={<Divider bg={isDark ? "dark.700" : "gray.100"} />}
        >
          <SettingsItem
            icon="headset"
            label="Contact Support"
            onPress={() => setShowSupport(true)}
          />
        </VStack>

        {/* Footer */}
        <Box py={6} alignItems="center">
          <Text color="gray.400" fontSize="sm">
            Made by Mudia Zuwa
          </Text>
        </Box>
      </ScrollView>

      {/* About Modal */}
      <Modal isOpen={showAbout} onClose={() => setShowAbout(false)} size="xl">
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>About BuzzIt</Modal.Header>
          <Modal.Body>
            <ScrollView>
              <VStack space={4} alignItems="center" py={4}>
                <Heading color="primary.600">BuzzIt</Heading>
                <Text color="gray.500">Version {APP_VERSION}</Text>
              </VStack>

              <Text fontWeight="600" mb={2}>
                Welcome to BuzzIt!
              </Text>
              <Text color="gray.600" mb={4}>
                BuzzIt is a modern social media platform designed to connect
                people through meaningful interactions. Share your thoughts,
                connect with friends, play games together, and stay updated with
                what matters most to you.
              </Text>

              <Text fontWeight="600" mb={2}>
                Features
              </Text>
              <VStack space={1} mb={4}>
                <Text color="gray.600">
                  • Posts & Feed: Share thoughts, images, and videos
                </Text>
                <Text color="gray.600">
                  • Real-time Messaging: Instant chat with friends
                </Text>
                <Text color="gray.600">
                  • Audio & Video Calls: Free calls anytime
                </Text>
                <Text color="gray.600">
                  • Interactive Games: Play with friends
                </Text>
                <Text color="gray.600">
                  • Friend System: Build your network
                </Text>
              </VStack>

              <Text fontWeight="600" mb={2}>
                Our Mission
              </Text>
              <Text color="gray.600" mb={4}>
                We believe in creating a safe, engaging, and fun social
                experience. Our goal is to bring people closer together through
                technology.
              </Text>

              <Text color="gray.400" fontSize="sm" textAlign="center">
                © 2024 BuzzIt. All rights reserved.
              </Text>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Terms Modal */}
      <Modal isOpen={showTerms} onClose={() => setShowTerms(false)} size="xl">
        <Modal.Content maxHeight="80%">
          <Modal.CloseButton />
          <Modal.Header>Terms of Service</Modal.Header>
          <Modal.Body>
            <ScrollView>
              <Text color="gray.500" fontSize="xs" mb={4}>
                Last updated: December 2024
              </Text>

              <Text fontWeight="600" mb={2}>
                1. Acceptance of Terms
              </Text>
              <Text color="gray.600" mb={4}>
                By accessing and using BuzzIt, you accept and agree to be bound
                by these Terms of Service. If you do not agree to these terms,
                please do not use our platform.
              </Text>

              <Text fontWeight="600" mb={2}>
                2. User Accounts
              </Text>
              <Text color="gray.600" mb={4}>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You must be at least 13 years old to create an account.
              </Text>

              <Text fontWeight="600" mb={2}>
                3. User Content
              </Text>
              <Text color="gray.600" mb={4}>
                You retain ownership of content you post. By posting content,
                you grant us a non-exclusive license to use, display, and
                distribute your content on our platform.
              </Text>

              <Text fontWeight="600" mb={2}>
                4. Acceptable Use
              </Text>
              <Text color="gray.600" mb={4}>
                You agree not to use the platform for illegal purposes, harass
                other users, post spam, or interfere with the platform's
                functionality.
              </Text>

              <Text fontWeight="600" mb={2}>
                5. Termination
              </Text>
              <Text color="gray.600" mb={4}>
                We reserve the right to suspend or terminate your account if you
                violate these terms or engage in behavior that harms our
                community.
              </Text>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        size="xl"
      >
        <Modal.Content maxHeight="80%">
          <Modal.CloseButton />
          <Modal.Header>Privacy Policy</Modal.Header>
          <Modal.Body>
            <ScrollView>
              <Text color="gray.500" fontSize="xs" mb={4}>
                Last updated: December 2024
              </Text>

              <Text fontWeight="600" mb={2}>
                1. Information We Collect
              </Text>
              <Text color="gray.600" mb={4}>
                We collect information you provide directly (account info,
                posts, messages) and usage data about how you interact with our
                platform.
              </Text>

              <Text fontWeight="600" mb={2}>
                2. How We Use Your Information
              </Text>
              <Text color="gray.600" mb={4}>
                We use your information to provide and improve our services,
                personalize your experience, and ensure platform security.
              </Text>

              <Text fontWeight="600" mb={2}>
                3. Information Sharing
              </Text>
              <Text color="gray.600" mb={4}>
                We do not sell your personal information. We may share your
                information with other users (based on your settings) and
                service providers.
              </Text>

              <Text fontWeight="600" mb={2}>
                4. Your Rights
              </Text>
              <Text color="gray.600" mb={4}>
                You have the right to access, update, or delete your data and
                control your privacy settings.
              </Text>

              <Text fontWeight="600" mb={2}>
                5. Children's Privacy
              </Text>
              <Text color="gray.600" mb={4}>
                BuzzIt is not intended for children under 13. We do not
                knowingly collect information from children under 13.
              </Text>
            </ScrollView>
          </Modal.Body>
        </Modal.Content>
      </Modal>

      {/* Support Chat Modal */}
      <Modal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        size="full"
      >
        <Modal.Content flex={1}>
          <SupportChat onClose={() => setShowSupport(false)} />
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default Settings;
