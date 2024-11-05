import React, { useState, useEffect } from "react";
import { Card, Button, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import updateDataInNode from "../Functions/UpdateDataInNode";
import FetchDataFromNode from "../Functions/FetchDataFromNode";

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

const CommentCard = ({ commentIndex, comment, postID, currentUserID }) => {
  const { uid, date, postText: text, media, likes = [] } = comment;

  const [commentLikes, setCommentLikes] = useState(likes);
  const [userData, setUserData] = useState({ profilePic: "", username: "" });
  const hasLiked = commentLikes.includes(currentUserID);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userPath = `UsersDetails/${uid}`;
        const userDetails = await FetchDataFromNode(userPath);
        if (userDetails) {
          setUserData({
            profilePic: userDetails.profilePhoto,
            username: userDetails.name,
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserData();
  }, [uid]);

  const handleLike = async () => {
    const updatedLikes = hasLiked
      ? commentLikes.filter((id) => id !== currentUserID)
      : [...commentLikes, currentUserID];

    await updateDataInNode(`Posts/${postID}/comments/${commentIndex}`, {
      likes: updatedLikes,
    });

    setCommentLikes(updatedLikes);
  };

  return (
    <Card className="mb-3 comment-card">
      <Card.Header className="d-flex align-items-center">
        <Link to={`/${uid}`}>
          <Image
            src={userData.profilePic || "/images/defaultProfile.png"} 
            roundedCircle
            width="30"
            height="30"
            alt={`${userData.username}'s profile picture`}
            className="me-2"
            style={{ cursor: "pointer" }}
          />
        </Link>
        <div>
          <Link
            to={`/${uid}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h6 className="mb-0" style={{ cursor: "pointer" }}>
              {userData.username}
            </h6>
          </Link>
          <small className="text-muted">
            {new Date(date).toLocaleString()}
          </small>
        </div>
      </Card.Header>

      {/* Comment Body: Text and Media */}
      <Card.Body>
        {text && <Card.Text>{text}</Card.Text>}

        {media && (
          <div style={{ height: "150px", overflow: "hidden" }}>
            {isVideo(media) ? (
              <video
                controls
                width="100%"
                height="100%"
                className="d-block w-100"
              >
                <source src={media} type={getVideoType(media)} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Card.Img
                variant="top"
                src={media}
                alt="Comment media"
                style={{ objectFit: "contain" }}
              />
            )}
          </div>
        )}
      </Card.Body>

      {/* Comment Footer: Like Button */}
      <Card.Footer className="d-flex justify-content-end">
        <Button variant="outline-primary" size="sm" onClick={handleLike}>
          <i className={`bi bi-heart${hasLiked ? "-fill" : ""}`}></i>{" "}
          {commentLikes.length} Like
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default CommentCard;
