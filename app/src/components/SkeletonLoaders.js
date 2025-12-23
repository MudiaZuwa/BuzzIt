import React from "react";
import { Box, HStack, VStack, Skeleton } from "native-base";

/**
 * Skeleton loader for PostCard
 */
export const PostSkeleton = () => (
  <Box bg="white" rounded="lg" shadow={1} mb={3} p={4}>
    <HStack space={3} alignItems="center" mb={3}>
      <Skeleton size="10" rounded="full" />
      <VStack flex={1} space={1}>
        <Skeleton.Text lines={1} w="40%" />
        <Skeleton.Text lines={1} w="25%" />
      </VStack>
    </HStack>
    <Skeleton.Text lines={3} mb={3} />
    <Skeleton h="200" rounded="md" mb={3} />
    <HStack justifyContent="space-between">
      <Skeleton w="20%" h={4} rounded="md" />
      <Skeleton w="20%" h={4} rounded="md" />
      <Skeleton w="20%" h={4} rounded="md" />
    </HStack>
  </Box>
);

/**
 * Skeleton loader for Chat List Item
 */
export const ChatListItemSkeleton = () => (
  <HStack
    bg="white"
    p={3}
    space={3}
    alignItems="center"
    borderBottomWidth={1}
    borderBottomColor="gray.100"
  >
    <Skeleton size="12" rounded="full" />
    <VStack flex={1} space={1}>
      <Skeleton.Text lines={1} w="60%" />
      <Skeleton.Text lines={1} w="40%" />
    </VStack>
    <Skeleton w={12} h={3} rounded="md" />
  </HStack>
);

/**
 * Skeleton loader for Profile Header
 */
export const ProfileHeaderSkeleton = () => (
  <VStack>
    {/* Cover Photo */}
    <Skeleton h={150} w="100%" />
    <VStack px={4} mt={-10}>
      {/* Avatar */}
      <Skeleton size="24" rounded="full" borderWidth={4} borderColor="white" />
      {/* Name and info */}
      <VStack mt={2} space={2}>
        <Skeleton.Text lines={1} w="50%" />
        <Skeleton.Text lines={1} w="30%" />
        <Skeleton.Text lines={2} w="80%" mt={2} />
      </VStack>
    </VStack>
  </VStack>
);

/**
 * Skeleton loader for Friend Card
 */
export const FriendCardSkeleton = () => (
  <HStack
    bg="white"
    p={3}
    space={3}
    alignItems="center"
    rounded="md"
    shadow={1}
    mb={2}
  >
    <Skeleton size="12" rounded="full" />
    <VStack flex={1} space={1}>
      <Skeleton.Text lines={1} w="50%" />
      <Skeleton.Text lines={1} w="30%" />
    </VStack>
    <Skeleton w={16} h={8} rounded="md" />
  </HStack>
);

/**
 * Skeleton loader for Notification Item
 */
export const NotificationSkeleton = () => (
  <HStack
    bg="white"
    p={3}
    space={3}
    alignItems="center"
    borderBottomWidth={1}
    borderBottomColor="gray.100"
  >
    <Skeleton size="10" rounded="full" />
    <VStack flex={1} space={1}>
      <Skeleton.Text lines={2} />
    </VStack>
    <Skeleton w={12} h={12} rounded="md" />
  </HStack>
);

/**
 * Skeleton loaders list wrapper for easy rendering
 */
export const PostSkeletonList = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <PostSkeleton key={index} />
    ))}
  </>
);

export const ChatListSkeletonList = ({ count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <ChatListItemSkeleton key={index} />
    ))}
  </>
);

export const FriendCardSkeletonList = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <FriendCardSkeleton key={index} />
    ))}
  </>
);

export const NotificationSkeletonList = ({ count = 5 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <NotificationSkeleton key={index} />
    ))}
  </>
);

export default {
  PostSkeleton,
  ChatListItemSkeleton,
  ProfileHeaderSkeleton,
  FriendCardSkeleton,
  NotificationSkeleton,
  PostSkeletonList,
  ChatListSkeletonList,
  FriendCardSkeletonList,
  NotificationSkeletonList,
};
