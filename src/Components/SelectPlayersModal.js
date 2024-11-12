import React, { useState, useEffect } from "react";
import { Modal, Button, Image, Form, InputGroup } from "react-bootstrap";
import CreateGameRoom from "../Functions/CreateGameRoom";
import sendGameRequest from "../Functions/SendGameRequest";
import { useNavigate } from "react-router-dom";

const SelectPlayersModal = ({ friendsList, show, handleClose, Game, UID }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const navigate = useNavigate();

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(friendId))
        return prevSelected.filter((id) => id !== friendId);
      else if (selectedFriends.length < Game.maxPlayers - 1)
        return [...prevSelected, friendId];
    });
  };

  const playersSelected = async () => {
    const room = await CreateGameRoom(Game.name, selectedFriends, UID);

    await Promise.all(
      selectedFriends.map((friendId) =>
        sendGameRequest(UID, friendId, Game.name, room)
      )
    );

    navigate(`/Games/${Game.path}/${room}`);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header className="d-flex justify-content-between">
        <Button variant="close" onClick={handleClose} className="m-0" />

        {selectedFriends.length > 0 && (
          <Button variant="primary" onClick={playersSelected}>
            Send Request
          </Button>
        )}
      </Modal.Header>
      <Modal.Body className="text-center">
        <Form.Group controlId="friendSearchInput" className="mb-3 text-start">
          <Form.Label>Select Friends</Form.Label>
          <InputGroup>
            <Form.Control type="text" placeholder="Search friends" />
          </InputGroup>
        </Form.Group>

        <div className="friend-list">
          {friendsList.map((friend) => {
            const isMember = selectedFriends.includes(friend.id);
            return (
              <div
                key={friend.id}
                className="d-flex align-items-center justify-content-between mb-2"
              >
                <div className="d-flex align-items-center">
                  <Image
                    src={friend.profilePhoto || "/images/defaultGroup.png"}
                    roundedCircle
                    style={{
                      height: "40px",
                      width: "40px",
                      marginRight: "10px",
                    }}
                  />
                  <span>{friend.name}</span>
                </div>

                <Button
                  variant={isMember ? "danger" : "success"}
                  onClick={() => toggleFriendSelection(friend.id)}
                >
                  {isMember ? "Remove" : "Add"}
                </Button>
              </div>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SelectPlayersModal;
