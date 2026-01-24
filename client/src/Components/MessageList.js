import { ListGroup, Row, Col } from "react-bootstrap";
// import { Link } from "react-router-dom"; // Use onClick instead

const MessageList = ({ chat, onClick }) => {
  // const chatLink = chat.isGroupChat ? chat.id : chat.chatWith; // Not needed handled by parent
  let chatProfilePhoto = "/images/defaultProfile.png"; // Default profile image

  if (chat) {
    chatProfilePhoto = chat.profilePhoto
      ? chat.profilePhoto
      : chat.isGroupChat
      ? "/images/defaultGroup.png"
      : "/images/defaultProfile.png";
  }
  return (
    <div onClick={onClick} className="chat-link" style={{ cursor: "pointer" }}>
      <ListGroup.Item key={chat.id} className="chat-list-item">
        <Row>
          <Col xs={2} className="text-center">
            <img
              src={chatProfilePhoto}
              alt={chat.name}
              className="chat-profile-pic"
            />
          </Col>
          <Col xs={8}>
            <strong className="chat-name">{chat.name}</strong>
            <br />
            <span className="chat-preview">
              {chat.lastMessageType === "image" ? (
                <span className="message-icon">🖼️</span>
              ) : chat.lastMessageType === "video" ? (
                <span className="message-icon">🎥</span>
              ) : null}
              {chat.lastMessage}
            </span>
          </Col>
        </Row>

        <Col className="text-right">
          <span className="chat-time">
            {new Date(chat.lastMessageTimestamp).toLocaleString()}
          </span>
        </Col>
      </ListGroup.Item>
    </div>
  );
};

export default MessageList;
