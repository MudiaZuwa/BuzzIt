import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import HandleGameRequest from "../Functions/HandleGameRequest.js";
import { Link, useNavigate } from "react-router-dom";

const ChatMessage = ({ message, currentUser, isGroupChat, chatId }) => {
  const [showImage, setShowImage] = useState(false);
  const isSender = message.sender === currentUser;
  const isGameRequest = message.messageType === "GameRequest";
  const navigate = useNavigate();

  const handleClose = () => setShowImage(false);
  const handleShow = () => setShowImage(true);

  const handleGameRequestMessage = (status) => {
    const messageId = `-MSG${message.timestamp}`;
    HandleGameRequest(
      chatId,
      message.message,
      messageId,
      status,
      message.room,
      navigate
    );
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

  const MessageText = ({ messageText }) => {
    if (!messageText) return null;
    const urlRegex =
      /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-z]{2,}(\.[a-z]{2,})?(\/\S*)?)/gi;

    const processedText = messageText.replace(urlRegex, (match) => {
      const url = match.startsWith("http") ? match : `https://${match}`;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
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

      <div className="message-bubble-wrapper">
        {!isSender && isGroupChat && (
          <Link to={`/${message.sender}`} className="sender-name">
            {message.senderName}
          </Link>
        )}

        <div className="message-bubble">
          {isGameRequest ? (
            <div className="game-request-container">
              <div className="message-text">
                {isSender ? "You" : "User"} sent a <b>{message.message}</b> game
                request
              </div>

              {message.requestStatus === undefined && !isSender && (
                <div className="game-request-actions">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleGameRequestMessage(true)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleGameRequestMessage(false)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {message.media && (
                <div onClick={handleShow} className="image-message">
                  {isVideo(message.media) ? (
                    <div className="position-relative">
                      <video
                        src={message.media}
                        className="message-image-thumbnail"
                        controls={false}
                        muted
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div
                        className="position-absolute bottom-0 start-0 p-2 text-light bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "30px",
                          height: "30px",
                          marginBottom: "4px",
                          marginLeft: "4px",
                        }}
                      >
                        <i className="bi bi-play-fill"></i>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={message.media}
                      alt="sent image"
                      className="message-image-thumbnail"
                    />
                  )}
                </div>
              )}
              <div className="message-text">
                <MessageText messageText={message.message} />
              </div>
            </div>
          )}

          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </div>

      {message.media && (
        <Modal
          show={showImage}
          onHide={handleClose}
          centered
          size="lg"
          contentClassName="bg-transparent border-0"
        >
          <Modal.Body className="image-modal-body rounded">
            {isVideo(message.media) ? (
              <video
                controls
                className="full-image"
                style={{ maxHeight: "80vh" }}
                autoPlay
              >
                <source
                  src={message.media}
                  type={getVideoType(message.media)}
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={message.media}
                alt="full image"
                className="full-image"
              />
            )}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default ChatMessage;
