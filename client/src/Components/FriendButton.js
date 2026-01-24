import React from "react";
import { Button } from "react-bootstrap";

const FriendButton = ({
  isFriend,
  friendRequestSent,
  friendRequestReceived,
  handleFriendToggle,
}) => {
  if (isFriend) {
    return (
      <Button variant="danger" onClick={handleFriendToggle}>
        Remove Friend
      </Button>
    );
  } else if (friendRequestSent) {
    return (
      <Button variant="secondary" onClick={handleFriendToggle}>
        Cancel Request
      </Button>
    );
  } else if (friendRequestReceived) {
    return (
      <Button variant="danger" onClick={handleFriendToggle}>
        Reject Request
      </Button>
    );
  } else {
    return (
      <Button variant="primary" onClick={handleFriendToggle}>
        Add Friend
      </Button>
    );
  }
};

export default FriendButton;
