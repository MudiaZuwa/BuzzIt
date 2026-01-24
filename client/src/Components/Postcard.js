import React from "react";
import { Card, Button, Image, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import updateDataInNode from "../Functions/UpdateDataInNode.js";

const isVideo = (url) => {
  const videoExtensions = ["mp4", "webm", "ogg"];
  const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";
  return videoExtensions.includes(extension);
};

const getVideoType = (url) => {
  const extension = url.split(".").pop().toLowerCase();
  switch (extension) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogg":
      return "video/ogg";
    default:
      return "video/mp4"; // Default to mp4 if unknown
  }
};

const PostCard = ({ post, currentUserID }) => {
  const {
    profilePic,
    username,
    uid,
    date,
    postText: text,
    media,
    likes,
    reposts,
    comments,
  } = post;

  const hasLiked = likes && likes.includes(currentUserID);
  const hasReposted =
    reposts && reposts.some((repost) => repost.userID === currentUserID);

  const handleLike = async () => {
    const postRef = `Posts/${post.id}`;
    const notificationsRef = `notifications/${uid}/Activities/${post.id}`;

    const currentDate = Date.now();

    const updatedLikes = hasLiked
      ? likes.filter((id) => id !== currentUserID)
      : [...(likes || []), currentUserID];

    await updateDataInNode(postRef, { likes: updatedLikes });

    if (currentUserID !== post.userId) {
      await updateDataInNode(notificationsRef, {
        likes: updatedLikes.map((likeId) => ({
          uid: likeId,
          date: currentDate,
        })),
      });
    }
  };

  const handleRepost = async () => {
    const postRef = `Posts/${post.id}`;
    const notificationsRef = `notifications/${uid}/Activities/${post.id}`;

    const repostData = {
      userID: currentUserID,
      date: Date.now(),
    };

    const updatedReposts = hasReposted
      ? reposts.filter((repost) => repost.userID !== currentUserID)
      : [...(reposts || []), repostData];

    await updateDataInNode(postRef, { reposts: updatedReposts });

    if (currentUserID !== uid) {
      await updateDataInNode(notificationsRef, updatedReposts);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/${uid}/${post.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: `${username}'s Post`,
          text: "Check out this post!",
          url: postUrl,
        })
        .then(() => {})
        .catch((error) => console.error("Error sharing post", error));
    } else {
      navigator.clipboard.writeText(postUrl).then(
        () => alert("Post URL copied to clipboard"),
        (err) => console.error("Failed to copy text: ", err)
      );
    }
  };

  return (
    <Card className="mb-4 post-card">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          {/* Profile link for profile pic and username */}
          <Link to={`/${uid}`}>
            <Image
              src={profilePic || "/images/defaultProfile.png"}
              roundedCircle
              width="40"
              height="40"
              alt={`${username}'s profile picture`}
              className="me-3"
              style={{ cursor: "pointer" }}
            />
          </Link>
          <div>
            <Link
              to={`/${uid}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h6 className="mb-0" style={{ cursor: "pointer" }}>
                {username}
              </h6>
            </Link>
            <small className="text-muted">
              {new Date(date).toLocaleString()}
            </small>
          </div>
        </div>
      </Card.Header>

      {/* Post Body */}

      <Card.Body>
        <Link
          to={`/${uid}/${post.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {text && <Card.Text>{text}</Card.Text>}
        </Link>
        {media && media.length > 0 && (
          <Carousel interval={null} indicators={false}>
            {media.map((mediaItem, index) => (
              <Carousel.Item key={index}>
                <Link
                  to={`/${uid}/${post.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      height: "250px",
                      overflow: "hidden",
                    }}
                  >
                    {isVideo(mediaItem) ? (
                      <video
                        controls
                        width="100%"
                        height="100%"
                        className="d-block w-100"
                        style={{ objectFit: "contain", margin: "auto" }}
                      >
                        <source
                          src={mediaItem}
                          type={getVideoType(mediaItem)}
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <Card.Img
                        variant="top"
                        src={mediaItem}
                        alt={`Media ${index + 1}`}
                        style={{ height: "100%", objectFit: "contain" }}
                      />
                    )}
                  </div>
                </Link>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Card.Body>

      {/* Post Footer with action buttons */}
      <Card.Footer className="d-flex justify-content-between gap-2 py-2">
        <Button
          variant={hasLiked ? "primary" : "outline-secondary"}
          onClick={handleLike}
          className="flex-fill d-flex align-items-center justify-content-center gap-1"
          size="sm"
        >
          <i className={`bi bi-heart${hasLiked ? "-fill" : ""}`}></i>
          <span>{likes ? likes.length : 0}</span>
        </Button>

        <Button
          variant={hasReposted ? "primary" : "outline-secondary"}
          onClick={handleRepost}
          className="flex-fill d-flex align-items-center justify-content-center gap-1"
          size="sm"
        >
          <i className={`bi bi-repeat`}></i>
          <span>{reposts ? reposts.length : 0}</span>
        </Button>

        <Link
          to={`/${uid}/${post.id}`}
          style={{ textDecoration: "none" }}
          className="flex-fill"
        >
          <Button
            variant="outline-secondary"
            className="w-100 d-flex align-items-center justify-content-center gap-1"
            size="sm"
          >
            <i className="bi bi-chat"></i>
            <span>{comments ? comments.length : 0}</span>
          </Button>
        </Link>

        <Button
          variant="outline-secondary"
          onClick={handleShare}
          className="d-flex align-items-center justify-content-center"
          size="sm"
        >
          <i className="bi bi-share"></i>
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default PostCard;
