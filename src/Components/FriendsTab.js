import React, { useEffect, useState } from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import { removeFriend } from "../Functions/FriendActions";
import FriendCard from "./FriendCard";
import FriendRequestCard from "./FriendRequestCard";

const FriendsTab = ({
  friendsList,
  mutualFriends,
  friendRequests,
  isCurrentUser,
  currentUserID,
}) => {
  const [friendsDetails, setFriendsDetails] = useState([]);
  const [requestsDetails, setRequestsDetails] = useState([]);
  const [mutualFriendsDetails, setMutualFriendsDetails] = useState([]);

  useEffect(() => {
    const fetchFriendsData = async () => {
      const friendsData = await Promise.all(
        friendsList.map(async (friendID) => {
          return await FetchDataFromNode(`UsersDetails/${friendID}`);
        })
      );
      setFriendsDetails(friendsData);
    };

    const fetchRequestsData = async () => {
      const requestsData = await Promise.all(
        friendRequests.map(async (request) => {
          return await FetchDataFromNode(`UsersDetails/${request.id}`);
        })
      );
      setRequestsDetails(requestsData);
    };

    const fetchMutualFriendsData = async () => {
      const mutualFriendsData = await Promise.all(
        mutualFriends.map(async (mutualFriendID) => {
          return await FetchDataFromNode(`UsersDetails/${mutualFriendID}`);
        })
      );
      setMutualFriendsDetails(mutualFriendsData);
    };

    fetchFriendsData();
    fetchRequestsData();
    fetchMutualFriendsData();
  }, [friendsList, friendRequests, mutualFriends]);

  return (
    <Tab.Pane eventKey="friends">
      <Tab.Container defaultActiveKey="friendsList">
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link eventKey="friendsList">Friends List</Nav.Link>
          </Nav.Item>
          {isCurrentUser ? (
            <Nav.Item>
              <Nav.Link eventKey="friendRequests">Friend Requests</Nav.Link>
            </Nav.Item>
          ) : (
            <Nav.Item>
              <Nav.Link eventKey="mutualFriends">Mutual Friends</Nav.Link>
            </Nav.Item>
          )}
        </Nav>

        <Tab.Content className="mt-4">
          {/* Friends List Tab */}
          <Tab.Pane eventKey="friendsList">
            <Row className="gx-4 gy-3">
              {friendsDetails.length > 0 ? (
                friendsDetails.map((friend, index) => (
                  <Col key={index} xs={12} sm={6} lg={4}>
                    <FriendCard
                      user={friend}
                      onRemoveFriend={() =>
                        removeFriend(friend.id, currentUserID)
                      }
                      isCurrentUser={isCurrentUser}
                    />
                  </Col>
                ))
              ) : (
                <p>No friends found.</p>
              )}
            </Row>
          </Tab.Pane>

          {isCurrentUser ? (
            <Tab.Pane eventKey="friendRequests">
              <Row className="gx-4 gy-3">
                {requestsDetails.length > 0 ? (
                  requestsDetails.map((request, index) => (
                    <Col key={index} xs={12} sm={6} lg={4}>
                      <FriendRequestCard
                        user={request}
                        currentUser={currentUserID}
                      />
                    </Col>
                  ))
                ) : (
                  <p>No friend requests found.</p>
                )}
              </Row>
            </Tab.Pane>
          ) : (
            // Mutual Friends Tab for non-current users
            <Tab.Pane eventKey="mutualFriends">
              <Row className="gx-4 gy-3">
                {mutualFriendsDetails.length > 0 ? (
                  mutualFriendsDetails.map((mutualFriend, index) => (
                    <Col key={index} xs={12} sm={6} lg={4}>
                      <FriendCard
                        user={mutualFriend}
                        onRemoveFriend={() =>
                          removeFriend(mutualFriend.id, currentUserID)
                        }
                      />
                    </Col>
                  ))
                ) : (
                  <p>No mutual friends found.</p>
                )}
              </Row>
            </Tab.Pane>
          )}
        </Tab.Content>
      </Tab.Container>
    </Tab.Pane>
  );
};

export default FriendsTab;
