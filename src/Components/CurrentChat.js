import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Card } from "react-bootstrap";
import HandleFileUpload from "../Functions/HandleFileUpload";
import sendMessage from "../Functions/SendMessage";
import ChatMessage from "./ChatMessage";
import GameListModal from "./GameListModal";
import { Link } from "react-router-dom";

const CurrentChat = ({
  chatId,
  uid,
  messages,
  recipientDetails,
  handleGroupModalOpen,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  let chatProfilePhoto = "/images/defaultProfile.png";
  let isGroupChat = false;
  const [showGameListModal, setShowGameListModal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleGameListModalOpen = () => setShowGameListModal(true);
  const handleGameListModalClose = () => setShowGameListModal(false);

  if (recipientDetails) {
    isGroupChat = recipientDetails.isGroupChat;

    chatProfilePhoto = recipientDetails.profilePhoto
      ? recipientDetails.profilePhoto
      : isGroupChat
      ? "/images/defaultGroup.png"
      : "/images/defaultProfile.png";
  }

  const isVideo = (file) => {
    const videoFormats = ["video/mp4", "video/webm", "video/ogg", "video/mov"];
    const fileExtension = file.type;

    return videoFormats.some((format) => format.includes(fileExtension));
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((selectedFiles) => selectedFiles.splice(index));
    setUploadProgress(0);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && selectedFiles.length === 0) return;
    setSendingMessage(true);
    try {
      let messageContent = newMessage.trim();
      let messageType = "text";
      let mediaUrl = null;

      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadedFiles = await HandleFileUpload(
          selectedFiles,
          "chat_files",
          uid,
          (fileName, progress) => {
            setUploadProgress(progress);
          }
        );

        mediaUrl = uploadedFiles[0];
        messageType = "media";

        setUploading(false);
        setUploadProgress(0);
        setSelectedFiles([]);
      }

      await sendMessage({
        currentUserId: uid,
        recipientUserId: recipientDetails.id,
        chatId,
        messageContent,
        messageType,
        mediaUrl,
        isGroupChat: isGroupChat,
        groupParticipants: recipientDetails.members,
      });
      setNewMessage("");
      setSendingMessage(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) =>
      [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/mov",
      ].includes(file.type)
    );
    setSelectedFiles(validFiles);
  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString(); // Format date
      if (!acc[date]) {
        acc[date] = []; // Initialize an array for a new date
      }
      acc[date].push(msg); // Add message to the corresponding date
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      {recipientDetails && (
        <div className="chat-container">
          <div className="chat-header d-flex align-items-center">
            <button className="back-button me-2">
              <i className="bi bi-arrow-left"></i>
            </button>
            {!isGroupChat ? (
              <Link
                to={`/${recipientDetails.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={chatProfilePhoto}
                  alt="Recipient Profile"
                  className="recipient-photo me-2"
                />
                <span className="recipient-username">
                  {recipientDetails.name}
                </span>
              </Link>
            ) : (
              <div>
                <img
                  src={chatProfilePhoto}
                  alt="Recipient Profile"
                  className="recipient-photo me-2"
                />
                <span className="recipient-username">
                  {recipientDetails.name}
                </span>
              </div>
            )}

            <button
              className="btn ms-auto"
              onClick={() =>
                !isGroupChat
                  ? handleGameListModalOpen()
                  : handleGroupModalOpen()
              }
            >
              <i
                className={
                  !isGroupChat ? "bi bi-controller" : "bi bi-info-circle"
                }
                style={{ fontSize: "1.5rem" }}
              ></i>
            </button>
          </div>

          {/* Chat Body Section */}
          <div className="chat-body d-flex flex-column h-100 ">
            <div className="recipient-info">
              <img
                src={chatProfilePhoto}
                alt="Recipient Profile"
                className="recipient-photo-large"
              />
              <h5 className="recipient-username-large">
                {recipientDetails.name}
              </h5>
              <p className="recipient-joined-date">
                {recipientDetails.isGroupChat ? "Created:" : "Joined:"}{" "}
                {new Date(recipientDetails.date).toLocaleDateString()}
              </p>
            </div>

            {/* Messages Container */}
            <div className="messages-container flex-grow-1">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date} className="message-group">
                  <div
                    className="date-label"
                    style={{ textAlign: "center", margin: "10px 0" }}
                  >
                    <strong>{date}</strong>
                  </div>
                  {msgs.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      currentUser={uid}
                      isGroupChat={isGroupChat}
                      chatId={chatId}
                    />
                  ))}
                </div>
              ))}
            </div>

            {uploading &&
              selectedFiles.map((file, fileIndex) => (
                <div className={`chat-message sent`} key={fileIndex}>
                  <Card className={`message-bubble sender`}>
                    <Card.Body>
                      <div className="image-message">
                        {isVideo(file) ? (
                          <div className="position-relative">
                            <video
                              src={URL.createObjectURL(file)}
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
                          </div>
                        ) : (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="message-image-thumbnail"
                          />
                        )}
                        <div className="progress-circle">
                          <svg className="progress-circle-svg">
                            <circle cx="30" cy="30" r="28" />
                            <circle
                              cx="30"
                              cy="30"
                              r="28"
                              style={{
                                strokeDashoffset: `calc(176 - (176 * ${uploadProgress}) / 100)`,
                              }}
                            />
                          </svg>
                          <div className="progress-text">
                            {Math.round(uploadProgress)}%
                          </div>
                        </div>
                      </div>
                      <Card.Footer className="message-timestamp">
                        <small className="text-muted">
                          {new Date(Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </small>
                      </Card.Footer>
                    </Card.Body>
                  </Card>
                </div>
              ))}

            <div ref={messagesEndRef} />
          </div>
          <Form
            onSubmit={handleSendMessage}
            className="message-form pb-4 pb-md-2 pb-lg-0"
            disabled={sendingMessage}
          >
            <Form.Group className="message-input-group">
              <div className="input-wrapper">
                <Form.Control
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="message-input"
                  disabled={sendingMessage}
                />

                {/* Image/Video Previews */}
                {selectedFiles.map((file, index) => (
                  <div key={index} className="image-preview-container">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Selected Image"
                        className="image-preview"
                      />
                    ) : file.type.startsWith("video/") ? (
                      <video
                        src={URL.createObjectURL(file)}
                        alt="Selected Video"
                        className="image-preview"
                        controls={false}
                        muted
                        preload="metadata"
                      />
                    ) : null}
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveFile(index)}
                      className="remove-image-button"
                    >
                      &times;
                    </Button>
                  </div>
                ))}

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="file-input"
                  style={{ display: "none" }}
                  id="file-upload"
                  disabled={sendingMessage}
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <i className="bi bi-paperclip"></i>
                </label>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="send-button"
                disabled={sendingMessage}
              >
                <i className="bi bi-send"></i>
              </Button>
            </Form.Group>
          </Form>
          <GameListModal
            show={showGameListModal}
            handleClose={handleGameListModalClose}
            uid={uid}
            friendId={recipientDetails.id}
          />
        </div>
      )}
    </>
  );
};

export default CurrentChat;
