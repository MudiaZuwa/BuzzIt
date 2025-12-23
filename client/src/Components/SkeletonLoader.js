import React from "react";
import "./SkeletonLoader.css";

/**
 * Base Skeleton Component with shimmer animation
 */
const Skeleton = ({ width, height, borderRadius, style, className = "" }) => (
  <div
    className={`skeleton-base ${className}`}
    style={{
      width: width || "100%",
      height: height || "1rem",
      borderRadius: borderRadius || "4px",
      ...style,
    }}
  />
);

/**
 * Circle Skeleton (for avatars)
 */
export const SkeletonCircle = ({ size = "40px" }) => (
  <Skeleton width={size} height={size} borderRadius="50%" />
);

/**
 * Text Line Skeleton
 */
export const SkeletonText = ({ lines = 1, width = "100%" }) => (
  <div className="skeleton-text-container">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 && lines > 1 ? "70%" : width}
        height="0.875rem"
        style={{ marginBottom: lines > 1 ? "0.5rem" : 0 }}
      />
    ))}
  </div>
);

/**
 * Skeleton loader for PostCard
 */
export const PostSkeleton = () => (
  <div className="card skeleton-post mb-3">
    <div className="card-body">
      {/* Header with avatar and name */}
      <div className="d-flex align-items-center mb-3">
        <SkeletonCircle size="48px" />
        <div className="ms-3 flex-grow-1">
          <Skeleton
            width="40%"
            height="1rem"
            style={{ marginBottom: "0.5rem" }}
          />
          <Skeleton width="25%" height="0.75rem" />
        </div>
      </div>
      {/* Post content */}
      <SkeletonText lines={3} />
      {/* Post image placeholder */}
      <Skeleton
        height="200px"
        borderRadius="8px"
        style={{ marginTop: "1rem", marginBottom: "1rem" }}
      />
      {/* Action buttons */}
      <div className="d-flex justify-content-between">
        <Skeleton width="20%" height="1.5rem" borderRadius="4px" />
        <Skeleton width="20%" height="1.5rem" borderRadius="4px" />
        <Skeleton width="20%" height="1.5rem" borderRadius="4px" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton loader for Chat List Item
 */
export const ChatListItemSkeleton = () => (
  <div className="d-flex align-items-center p-3 border-bottom skeleton-chat-item">
    <SkeletonCircle size="50px" />
    <div className="ms-3 flex-grow-1">
      <Skeleton width="60%" height="1rem" style={{ marginBottom: "0.5rem" }} />
      <Skeleton width="80%" height="0.75rem" />
    </div>
    <div className="text-end">
      <Skeleton
        width="50px"
        height="0.75rem"
        style={{ marginBottom: "0.5rem" }}
      />
      <Skeleton
        width="24px"
        height="24px"
        borderRadius="50%"
        style={{ marginLeft: "auto" }}
      />
    </div>
  </div>
);

/**
 * Skeleton loader for Profile Header
 */
export const ProfileHeaderSkeleton = () => (
  <div className="skeleton-profile">
    {/* Cover Photo */}
    <Skeleton height="150px" borderRadius="0" />
    {/* Profile section */}
    <div className="d-flex align-items-end px-3" style={{ marginTop: "-40px" }}>
      <SkeletonCircle size="100px" />
      <div className="ms-3 flex-grow-1 mb-2">
        <Skeleton
          width="40%"
          height="1.5rem"
          style={{ marginBottom: "0.5rem" }}
        />
        <Skeleton width="25%" height="1rem" />
      </div>
      <Skeleton width="100px" height="36px" borderRadius="20px" />
    </div>
    {/* About section */}
    <div className="px-3 mt-3">
      <SkeletonText lines={2} width="80%" />
    </div>
  </div>
);

/**
 * Skeleton loader for Friend Card
 */
export const FriendCardSkeleton = () => (
  <div className="d-flex align-items-center p-3 mb-2 bg-light rounded skeleton-friend-card">
    <SkeletonCircle size="50px" />
    <div className="ms-3 flex-grow-1">
      <Skeleton width="50%" height="1rem" style={{ marginBottom: "0.5rem" }} />
      <Skeleton width="30%" height="0.75rem" />
    </div>
    <Skeleton width="80px" height="32px" borderRadius="4px" />
  </div>
);

/**
 * Skeleton loader for Notification Item
 */
export const NotificationSkeleton = () => (
  <div className="d-flex align-items-center p-3 border-bottom skeleton-notification">
    <SkeletonCircle size="45px" />
    <div className="ms-3 flex-grow-1">
      <SkeletonText lines={2} />
    </div>
    <Skeleton width="50px" height="50px" borderRadius="8px" />
  </div>
);

/**
 * Skeleton loader for Game Card
 */
export const GameCardSkeleton = () => (
  <div className="card skeleton-game-card mb-3">
    <Skeleton height="120px" borderRadius="8px 8px 0 0" />
    <div className="card-body">
      <Skeleton
        width="60%"
        height="1.25rem"
        style={{ marginBottom: "0.5rem" }}
      />
      <Skeleton width="40%" height="0.875rem" />
    </div>
  </div>
);

/**
 * Skeleton list wrappers
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

export const GameCardSkeletonList = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <GameCardSkeleton key={index} />
    ))}
  </>
);

export default Skeleton;
