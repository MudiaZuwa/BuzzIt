import React from "react";
import { Button, Image } from "react-bootstrap";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "../Functions/FriendActions.js";

const FriendRequestCard = ({ user, currentUser }) => (
  <div className="friend-request-card p-3 mb-3 border rounded shadow-sm">
    <div className="d-flex flex-wrap align-items-center">
      <Image
        src={user.profilePhoto || "/images/defaultProfile.png"}
        roundedCircle
        style={{ width: "50px", height: "50px", marginRight: "15px" }}
      />

      <div className="flex-grow-1">
        <h5 className="fw-bold mb-0">{user.name}</h5>
      </div>

      <div className="d-flex justify-content-end mt-2">
        <Button
          variant="success"
          className="me-2 mb-2 mb-md-0"
          onClick={() => acceptFriendRequest(user.id, currentUser)}
        >
          Accept
        </Button>
        <Button
          variant="danger"
          onClick={() => rejectFriendRequest(user.id, currentUser)}
        >
          Reject
        </Button>
      </div>
    </div>
  </div>
);

export default FriendRequestCard;
