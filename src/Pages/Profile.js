import React, { useEffect, useState } from "react";
import { Container, Row, Col, Image, Button, Nav, Tab } from "react-bootstrap";
import ProfileHeader from "../Components/ProfileHeader";
import FriendButton from "../Components/FriendButton";
import PostsTab from "../Components/PostsTab";
import FriendsTab from "../Components/FriendsTab";
import MediaTab from "../Components/MediaTab";
import HomeLeftSideBar from "../Components/HomeLeftSideBar";
import HomeRightSideBar from "../Components/HomeRightSideBar";
import { useParams } from "react-router-dom";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser";
import ListenDataFromNode from "../Functions/ListenDataFromNode";
import UpdateDataInNode from "../Functions/UpdateDataInNode";
import DeleteDataInNode from "../Functions/DeleteDataInNode";
import MobileBottomNavbar from "../Components/MobileBottomNavbar";

const ProfilePage = () => {
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);
  const { userId } = useParams();
  const { uid, loggedIn } = UseVerifyUser();
  const [userDetails, setUserDetails] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);

  const handleFriendToggle = async () => {
    if (isFriend) {
      await Promise.all([
        DeleteDataInNode(`friend/${userId}/Friends/${uid}`),
        DeleteDataInNode(`friend/${uid}/Friends/${userId}`),
      ]);
      setIsFriend(false);
    } else if (friendRequestSent) {
      await Promise.all([
        DeleteDataInNode(`friend/${userId}/Friendrequest/${uid}`),
        DeleteDataInNode(`friend/${uid}/Friendrequest/${userId}`),
        DeleteDataInNode(`notifications/${uid}/Friendrequest/${userId}`),
      ]);
      setFriendRequestSent(false);
    } else if (friendRequestReceived) {
      await Promise.all([
        DeleteDataInNode(`friend/${userId}/Friendrequest/${uid}`),
        DeleteDataInNode(`friend/${uid}/Friendrequest/${userId}`),
      ]);
      setFriendRequestReceived(false);
    } else {
      const friendRequestDataForCurrentUser = {
        Date: Date.now(),
        Request: "sent",
        id: userId,
      };

      const friendRequestDataForViewedUser = {
        Date: Date.now(),
        Request: "received",
        id: uid,
      };

      await Promise.all([
        UpdateDataInNode(
          `friend/${userId}/Friendrequest/${uid}`,
          friendRequestDataForViewedUser
        ),
        UpdateDataInNode(
          `friend/${uid}/Friendrequest/${userId}`,
          friendRequestDataForCurrentUser
        ),
        UpdateDataInNode(
          `notifications/${userId}/Friendrequest/${uid}`,
          friendRequestDataForViewedUser
        ),
        UpdateDataInNode(`notifications/${userId}`, { viewed: false }),
      ]);
      setFriendRequestSent(true);
    }
  };

  useEffect(() => {
    const unsubscribeUserDetails = ListenDataFromNode(
      `UsersDetails/${userId}`,
      (data) => {
        if (data && data.name) {
          setUserDetails({
            name: data.name,
            profilePhoto: data.profilePhoto,
            coverPhoto: data.coverPhoto,
            dob: data.dob,
            about: data.about,
            joinedDate: data.date,
            posts: data.posts || [],
            previousCoverPhotos: data.previousCoverPhotos || [],
            previousProfilePhotos: data.previousProfilePhotos || [],
          });
        }
      }
    );
    return () => unsubscribeUserDetails();
  }, [userId]);

  useEffect(() => {
    fetchFriendsAndRequests();
    if (userDetails) handleGetPosts();
  }, [userDetails, uid]);

  const fetchFriendsAndRequests = async () => {
    let friendsArray;
    try {
      const friendsPath = `friend/${userId}/Friends`;
      const friends = await ListenDataFromNode(friendsPath, (data) => {
        friendsArray = data ? Object.keys(data) : [];
        setFriendsList(friendsArray);
        if (friendsArray) setIsFriend(friendsArray.includes(uid));
      });

      const friendRequestsPath = `friend/${uid}/Friendrequest`;
      await ListenDataFromNode(friendRequestsPath, (data) => {
        const requestsArray = data
          ? Object.values(data).filter(
              (request) => request.Request === "received"
            )
          : [];

        setFriendRequests(requestsArray);
        setFriendRequestReceived(
          requestsArray.includes(userId) && data[userId]?.Request === "received"
        );
        setFriendRequestSent(
          requestsArray.includes(userId) && data[userId]?.Request === "sent"
        );
      });

      if (userId !== uid && friendsArray) {
        const currentUserFriendsPath = `friend/${uid}/Friends`;
        ListenDataFromNode(currentUserFriendsPath, (currentUserFriends) => {
          const mutualFriendsArray = currentUserFriends
            ? Object.keys(currentUserFriends).filter((friendID) =>
                friendsArray.includes(friendID)
              )
            : [];
          setMutualFriends(mutualFriendsArray);
        });
      }
    } catch (error) {
      console.error("Error fetching friends and requests:", error);
    }
  };

  const handleGetPosts = async () => {
    try {
      const nodePath = `Posts/`;
      ListenDataFromNode(nodePath, (postsData) => {
        if (postsData) {
          const filteredPosts = Object.entries(postsData)
            .filter(([_, post]) => post.uid === userId)
            .map(([postId, post]) => ({
              postId,
              ...post,
              username: userDetails.name,
              profilePic: userDetails.profilePhoto,
            }));
          setPosts(filteredPosts);
        }
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <>
      <Container fluid>
        <Row>
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />
          <Col
            md={7}
            className="vh-100 pb-5 pb-md-0"
            style={{ overflowY: "auto" }}
          >
            {userDetails && (
              <div>
                <Row>
                  <Col>
                    <Image
                      src={userDetails.coverPhoto || "/images/defaultCover.png"}
                      fluid
                      className="mb-3"
                      style={{ height: "150px" }}
                      alt="Cover"
                    />
                  </Col>
                </Row>

                <ProfileHeader
                  userDetails={userDetails}
                  friendsList={friendsList}
                  mutualFriends={mutualFriends}
                  friendRequests={friendRequests}
                  isFriend={isFriend}
                  renderFriendButton={() => (
                    <FriendButton
                      isFriend={isFriend}
                      friendRequestSent={friendRequestSent}
                      friendRequestReceived={friendRequestReceived}
                      handleFriendToggle={handleFriendToggle}
                    />
                  )}
                  uid={uid}
                  userID={userId}
                />

                <Row>
                  <Col>
                    <Tab.Container defaultActiveKey="posts">
                      <Nav
                        variant="tabs"
                        className="d-flex justify-content-between"
                      >
                        <Nav.Item className="flex-fill text-center">
                          <Nav.Link eventKey="posts">Posts</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="flex-fill text-center">
                          <Nav.Link eventKey="friends">Friends</Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="flex-fill text-center">
                          <Nav.Link eventKey="media">Media</Nav.Link>
                        </Nav.Item>
                      </Nav>

                      <Tab.Content className="mt-4">
                        <PostsTab posts={posts} currentUserID={uid} />

                        <FriendsTab
                          friendsList={friendsList}
                          mutualFriends={mutualFriends}
                          friendRequests={friendRequests}
                          isCurrentUser={userId === uid}
                          currentUserID={userId}
                        />

                        <MediaTab
                          posts={posts}
                          previousProfilePhotos={
                            userDetails.previousProfilePhotos
                          }
                          previousCoverPhotos={userDetails.previousCoverPhotos}
                        />
                      </Tab.Content>
                    </Tab.Container>
                  </Col>
                </Row>
              </div>
            )}
          </Col>

          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </>
  );
};

export default ProfilePage;
