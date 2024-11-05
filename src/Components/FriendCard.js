import React from "react";
import { Link } from "react-router-dom";

const FriendCard = ({ user, onRemoveFriend, isCurrentUser }) => {
  return (
    <div className="friend-card p-3 mb-3 border rounded shadow-sm">
      <div className="d-flex flex-wrap align-items-center">
        <img
          src={user.profilePhoto || "/images/defaultProfile.png"}
          alt={user.name}
          className="rounded-circle"
          style={{ width: "50px", height: "50px", marginRight: "15px" }}
        />

        <div className="flex-grow-1">
          <Link to={`/${user.id}`} className="text-dark fw-bold">
            {user.name}
          </Link>
        </div>
        {isCurrentUser && (
          <div className="d-flex justify-content-end mt-2">
            <button
              className="btn btn-danger btn-sm me-2 mb-2 mb-md-0"
              onClick={onRemoveFriend}
            >
              Remove Friend
            </button>

            <Link to={`/messages/${user.id}`} className="">
              <button className="btn btn-primary btn-sm">Message</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendCard;
