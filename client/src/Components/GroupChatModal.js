import React, { useState, useEffect } from "react";
import { Modal, Button, Image, Form, InputGroup } from "react-bootstrap";
import HandleFileUpload from "../Functions/HandleFileUpload.js";
import { handleSaveGroup } from "../Functions/HandleSaveGroup.js"; 

const GroupChatModal = ({ uid, show, onClose, friendsList, groupDetails }) => {
  if (groupDetails) if (!groupDetails.isGroupChat) groupDetails = null;
  const [groupIcon, setGroupIcon] = useState(null);
  const [groupIconUrl, setGroupIconUrl] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  const isAdmin = groupDetails?.createdBy === uid;

  useEffect(() => {
    if (groupDetails) {
      setGroupIconUrl(groupDetails.profilePhoto);
      setGroupName(groupDetails.name);
      setSelectedFriends(Object.keys(groupDetails.members || {}));
    } else {
      setGroupIconUrl();
      setGroupName();
      setSelectedFriends([]);
    }
  }, [groupDetails]);

  const handleGroupIconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setGroupIcon(file);
      const imageUrl = URL.createObjectURL(file);
      setGroupIconUrl(imageUrl);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  const saveGroup = async () => {
    await handleSaveGroup({
      groupName,
      selectedFriends,
      groupIcon,
      groupIconUrl,
      uid,
      groupDetails,
      onClose,
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header className="d-flex justify-content-between">
        <Button variant="close" onClick={onClose} className="m-0" />
        {(isAdmin || !groupDetails) && (
          <Button variant="primary" onClick={saveGroup} className="ms-auto">
            Save
          </Button>
        )}
      </Modal.Header>

      <Modal.Body className="text-center">
        <div className="d-flex justify-content-center mb-4 position-relative">
          <div style={{ position: "relative", display: "inline-block" }}>
            <Image
              src={groupIconUrl || "/images/defaultGroup.png"}
              roundedCircle
              style={{
                height: "100px",
                width: "100px",
                marginRight: "20px",
                position: "relative",
              }}
              alt="Group Icon"
            />
            {(isAdmin || !groupDetails) && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGroupIconChange}
                  style={{ display: "none" }}
                  id="group-icon-upload"
                />
                <label
                  htmlFor="group-icon-upload"
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    cursor: "pointer",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "50%",
                    padding: "10px",
                    width: "40px",
                    height: "40px",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-75%, -50%)",
                  }}
                >
                  <i
                    className="bi bi-camera"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Group Name Input */}
        <Form.Group controlId="groupNameInput" className="mb-3 text-start">
          <Form.Label>Group Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            disabled={!isAdmin && groupDetails}
          />
        </Form.Group>

        {/* Add Members or Members Label */}
        <Form.Group controlId="friendSearchInput" className="mb-3 text-start">
          <Form.Label>
            {isAdmin || !groupDetails ? "Add Friends" : "Members"}
          </Form.Label>
          <InputGroup>
            <Form.Control type="text" placeholder="Search friends" />
          </InputGroup>
        </Form.Group>

        {/* Friends List */}
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
                {(isAdmin || !groupDetails) && (
                  <Button
                    variant={isMember ? "danger" : "success"}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    {isMember ? "Remove" : "Add"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default GroupChatModal;
