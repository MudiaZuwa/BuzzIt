import React, { useState, useEffect } from "react";
import { Card, Modal, Button } from "react-bootstrap";
import HandleGameRequest from "../Functions/HandleGameRequest";
import { Link } from "react-router-dom";

const ChatMessage = ({ message, currentUser, isGroupChat, chatId }) => {
  const [showImage, setShowImage] = useState(false);
  const isSender = message.sender === currentUser;
  const isMedia = message.messageType === "media";
  const isGameRequest = message.messageType === "GameRequest";

  const handleClose = () => setShowImage(false);
  const handleShow = () => setShowImage(true);

  const handleGameRequestMessage = (status) => {
    const messageId = `-MSG${message.timestamp}`;
    HandleGameRequest(chatId, message.message, messageId, status, message.room);
  };

  useEffect(() => {
    if (isGameRequest && message.requestStatus === undefined) {
      const currentTime = new Date().getTime();
      const messageTime = new Date(message.timestamp).getTime();
      const tenMinutes = 10 * 60 * 1000;

      if (currentTime - messageTime > tenMinutes) {
        handleGameRequestMessage(false);
      }
    }
  }, [isGameRequest, message, chatId]);

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
        return "video/mp4";
    }
  };

  return (
    <div className={`chat-message ${isSender ? "sent" : "received"}`}>
      {!isSender && isGroupChat && (
        <Link to={`/${message.sender}`} className="profile-photo-container">
          <img
            src={message.senderProfilePhoto || "/images/defaultProfile.png"}
            alt="sender profile"
            className="sender-profile-photo"
          />
        </Link>
      )}

      <Card className={`message-bubble ${isSender ? "sender" : "receiver"}`}>
        <Card.Body>
          {!isSender && isGroupChat && (
            <Link to={`/${message.sender}`} className="sender-name">
              {message.senderName}
            </Link>
          )}

          {isGameRequest ? (
            <div>
              <Card.Text>
                {isSender ? "You" : "User"} sent a <b>{message.message}</b> game
                request
              </Card.Text>

              {message.requestStatus === undefined && !isSender && (
                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant="success"
                    onClick={() => handleGameRequestMessage(true)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleGameRequestMessage(false)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ) : isMedia ? (
            <div onClick={handleShow} className="image-message">
              {isVideo(message.message) ? (
                <div className="position-relative">
                  <video
                    src={message.message}
                    className="w-100"
                    style={{
                      objectFit: "cover",
                      height: "auto",
                    }}
                    controls={false}
                    muted
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div
                    className="position-absolute bottom-0 start-0 p-2 text-light bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "30px", height: "30px" }}
                  >
                    <i className="bi bi-play-fill"></i>
                  </div>
                </div>
              ) : (
                <img
                  src={message.message}
                  alt="sent image"
                  className="message-image-thumbnail"
                />
              )}
            </div>
          ) : (
            <Card.Text>{message.message}</Card.Text>
          )}

          <Card.Footer className="message-timestamp">
            <small className="text-muted">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </small>
          </Card.Footer>
        </Card.Body>
      </Card>

      <Modal show={showImage} onHide={handleClose} centered>
        <Modal.Body className="image-modal-body">
          {isVideo(message.message) ? (
            <video
              controls
              width="100%"
              height="100%"
              className="d-block w-100"
              style={{ objectFit: "contain", margin: "auto" }}
            >
              <source
                src={message.message}
                type={getVideoType(message.message)}
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={message.message}
              alt="full image"
              className="full-image"
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ChatMessage;
