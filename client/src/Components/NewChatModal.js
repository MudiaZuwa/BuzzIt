import React, { useState, useEffect } from "react";
import { Modal, Form, ListGroup, InputGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const NewChatModal = ({ show, handleClose, friendsList }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFriends, setFilteredFriends] = useState(friendsList);

  useEffect(() => {
    const filtered = friendsList.filter((friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [searchQuery, friendsList]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="d-flex justify-content-between">
        <Modal.Title>NewChat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        <ListGroup variant="flush">
          {filteredFriends.map((friend) => (
            <ListGroup.Item
              key={friend.id}
              className="d-flex align-items-center"
            >
              <img
                src={friend.profilePhoto || "/images/defaultProfile.png"}
                alt={friend.name}
                className="rounded-circle"
                style={{ width: "40px", height: "40px", marginRight: "10px" }}
              />
              <Link
                to={`/messages/${friend.id}`}
                className="text-decoration-none"
              >
                {friend.name}
              </Link>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default NewChatModal;
