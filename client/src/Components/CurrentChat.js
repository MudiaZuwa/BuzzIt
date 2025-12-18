import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Card } from "react-bootstrap";
import HandleFileUpload from "../Functions/HandleFileUpload.js";
import sendMessage from "../Functions/SendMessage.js";
import ChatMessage from "./ChatMessage.js";
import GameListModal from "./GameListModal.js";
import { Link, useNavigate } from "react-router-dom";
import VideoCallModal from "./VideoCallModal.js";
import AudioCallModal from "./AudioCallModal.js";
import FetchDataFromNode from "../Functions/FetchDataFromNode.js";

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
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showAudioCallModal, setShowAudioCallModal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const navigate = useNavigate();

  const handleVideoCallModalOpen = () => setShowVideoCallModal(true);
  const handleVideoCallModalClose = () => setShowVideoCallModal(false);

  const handleAudioCallModalOpen = () => setShowAudioCallModal(true);
  const handleAudioCallModalClose = () => setShowAudioCallModal(false);

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
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

    // Guardrail: Check if recipient has a name
    if (
      !recipientDetails ||
      !recipientDetails.name ||
      recipientDetails.name === ""
    ) {
      alert(
        "You cannot message this user because their profile is incomplete."
      );
      return;
    }

    try {
      // Guardrail: Check if current user has a name
      const currentUserDetails = await FetchDataFromNode(`UsersDetails/${uid}`);
      if (!currentUserDetails || !currentUserDetails.name) {
        alert(
          "Please complete your profile (set a name) in settings before sending messages."
        );
        return;
      }

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
    } catch (error) {
      console.error("Error verifying profile:", error);
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const groupMessagesByDate = (messages) => {
    return messages.reduce((acc, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(msg);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <>
      {recipientDetails && (
        <div className="chat-container">
          <div className="chat-header d-flex align-items-center  p-sm-2">
            <button
              className="back-button me-2"
              onClick={() => navigate(`/messages`)}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            {!isGroupChat ? (
              <Link
                to={`/${recipientDetails.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
                className="overflow-x-hidden d-flex"
              >
                <img
                  src={chatProfilePhoto}
                  alt="Recipient Profile"
                  className="recipient-photo me-2"
                />
                <span className="recipient-username text-truncate">
                  {recipientDetails.name}
                </span>
              </Link>
            ) : (
              <div className="overflow-x-hidden d-flex ">
                <img
                  src={chatProfilePhoto}
                  alt="Recipient Profile"
                  className="recipient-photo me-2 text-truncate"
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
            {!isGroupChat && (
              <>
                <button className="btn">
                  <i
                    className="bi bi-telephone"
                    style={{ fontSize: "1.2rem" }}
                    onClick={() => handleAudioCallModalOpen()}
                  ></i>
                </button>
                <button className="btn">
                  <i
                    className="bi bi-camera-video"
                    style={{ fontSize: "1.2rem" }}
                    onClick={() => handleVideoCallModalOpen()}
                  ></i>
                </button>
              </>
            )}
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
                {new Date(recipientDetails.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
                    <strong>{formatDate(date)}</strong>
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
            onSubmit={(e) => handleSendMessage(e)}
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
                  onPaste={(e) => {
                    const items = e.clipboardData.items;
                    for (let i = 0; i < items.length; i++) {
                      if (
                        items[i].type.indexOf("image") !== -1 ||
                        items[i].type.indexOf("video") !== -1
                      ) {
                        const file = items[i].getAsFile();
                        setSelectedFiles([file]);
                      }
                    }
                  }}
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

          <VideoCallModal
            show={showVideoCallModal}
            handleClose={handleVideoCallModalClose}
            uid={uid}
            userId={recipientDetails.id}
            caller={"user"}
            reciepientDetails={recipientDetails}
          />
          <AudioCallModal
            show={showAudioCallModal}
            handleClose={handleAudioCallModalClose}
            uid={uid}
            userId={recipientDetails.id}
            caller={"user"}
            reciepientDetails={recipientDetails}
          />
        </div>
      )}
    </>
  );
};

export default CurrentChat;
