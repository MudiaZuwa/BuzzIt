import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Card, Spinner } from "react-bootstrap";
import axios from "axios";
import "../CSS/chat.css";

// Support Bot Chat Component (uses same UI as CurrentChat)
const SupportChat = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hi! I'm BuzzIt Support Bot. How can I help you today?",
      sender: "bot",
      timestamp: Date.now(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // TODO: Replace with your N8N webhook URL
  const WEBHOOK_URL =
    process.env.REACT_APP_SUPPORT_WEBHOOK_URL ||
    "https://your-n8n-webhook.com/webhook/support";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const userMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setSending(true);

    try {
      const response = await axios.post(WEBHOOK_URL, {
        message: userMessage.content,
        sessionId: `support_${Date.now()}`,
      });

      const botResponse = {
        id: Date.now() + 1,
        content:
          response.data?.response ||
          response.data?.message ||
          "Thanks for your message! Our team will get back to you soon.",
        sender: "bot",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending to support bot:", error);
      const errorMessage = {
        id: Date.now() + 1,
        content:
          "Sorry, I'm having trouble connecting. Please try again later or email us at support@buzzit.com",
        sender: "bot",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="chat-container" style={{ height: "500px" }}>
      <div className="chat-header d-flex align-items-center p-2">
        <button className="back-button me-2" onClick={onClose}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <img
          src="https://ui-avatars.com/api/?name=Support&background=0d7059&color=fff&size=40"
          alt="Support Bot"
          className="recipient-photo me-2"
        />
        <span className="recipient-username">BuzzIt Support</span>
      </div>

      <div className="chat-body d-flex flex-column h-100">
        <div
          className="messages-container flex-grow-1"
          style={{ overflowY: "auto", padding: "16px" }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${
                msg.sender === "user" ? "sent" : "received"
              }`}
            >
              <Card
                className={`message-bubble ${
                  msg.sender === "user" ? "sender" : "receiver"
                }`}
              >
                <Card.Body>
                  <p className="mb-1">{msg.content}</p>
                  <small className="text-muted">
                    {formatTime(msg.timestamp)}
                  </small>
                </Card.Body>
              </Card>
            </div>
          ))}
          {sending && (
            <div className="chat-message received">
              <Card className="message-bubble receiver">
                <Card.Body>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Thinking...
                </Card.Body>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <Form onSubmit={handleSendMessage} className="message-form pb-2">
          <Form.Group className="message-input-group">
            <div className="input-wrapper">
              <Form.Control
                type="text"
                placeholder="Type your question..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="message-input"
                disabled={sending}
              />
            </div>
            <Button
              variant="primary"
              type="submit"
              className="send-button"
              disabled={sending || !newMessage.trim()}
            >
              <i className="bi bi-send"></i>
            </Button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default SupportChat;
