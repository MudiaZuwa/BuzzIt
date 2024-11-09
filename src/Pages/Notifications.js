import React, { useEffect, useState } from "react";
import {
  Tab,
  Tabs,
  Col,
  Card,
  Button,
  Image,
  Row,
  Container,
  Nav,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import { GetUserNotifications } from "../Functions/GetUserNotifications";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser";
import HomeLeftSideBar from "../Components/HomeLeftSideBar";
import MobileBottomNavbar from "../Components/MobileBottomNavbar";
import HomeRightSideBar from "../Components/HomeRightSideBar";
import FriendRequestCard from "../Components/FriendRequestCard";
import AuthModal from "../Auth/AuthModal";
import ProfileEditModal from "../Components/ProfileEditModal";

const Notifications = ({}) => {
  const [key, setKey] = useState("Activities");
  const [activities, setActivities] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState({});
  const { uid, loggedIn, isPending } = UseVerifyUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

  const handleProfileEditModalOpen = () => setShowProfileEditModal(true);
  const handleProfileEditModalClose = () => setShowProfileEditModal(false);

  const handleAuthModalOpen = () => setShowAuthModal(true);
  const handleAuthModalClose = () => setShowAuthModal(false);

  const fetchNotifications = async (uid) => {
    try {
      const notifications = await GetUserNotifications(uid);
      setNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (uid) {
      fetchNotifications(uid);
    }
  }, [uid]);

  useEffect(() => {
    if (isPending) return;
    if (!loggedIn) handleAuthModalOpen();
  }, [isPending]);

  useEffect(() => {
    const fetchUserDetails = async (uid) => {
      const userDetails = await FetchDataFromNode(`UsersDetails/${uid}`);
      return {
        uid,
        name: userDetails?.name,
        profilePhoto: userDetails?.profilePhoto,
      };
    };

    const fetchFriendRequestDetails = async () => {
      if (!notifications?.Friendrequest) return;

      const updatedRequests = await Promise.all(
        Object.values(notifications.Friendrequest).map((request) =>
          fetchUserDetails(request.uid).then((userDetails) => ({
            ...request,
            ...userDetails,
          }))
        )
      );

      setFriendRequests(updatedRequests);
    };

    const fetchActivityDetails = async () => {
      if (!notifications?.Activities) {
        return;
      }

      const fetchInteractionDetails = async (uids) => {
        return await Promise.all(uids?.map(fetchUserDetails) || []);
      };

      const updatedActivities = await Promise.all(
        Object.entries(notifications.Activities).map(
          async ([postId, activity]) => {
            const updatedComments = activity.comments
              ? await Promise.all(
                  activity.comments.map(async (comment) => {
                    const commentUser = await fetchUserDetails(comment.uid);
                    return { ...comment, user: commentUser };
                  })
                )
              : [];

            const postLikes = activity.likes
              ? await Promise.all(
                  activity.likes.map(async (like) => {
                    const likeUser = await fetchUserDetails(like.uid);
                    return { ...like, user: likeUser };
                  })
                )
              : [];

            const postReposts = activity.reposts
              ? await Promise.all(
                  activity.reposts.map(async (repost) => {
                    const repostUser = await fetchUserDetails(repost.uid);
                    return { ...repost, user: repostUser };
                  })
                )
              : [];

            return {
              postId,
              comments: updatedComments,
              likes: postLikes,
              reposts: postReposts,
            };
          }
        )
      );

      setActivities(updatedActivities);
    };

    fetchFriendRequestDetails();
    fetchActivityDetails();
  }, [notifications]);

  const groupByDate = (notifications) => {
    return notifications.reduce((groups, post) => {
      const allActivities = [
        ...post.comments.map((comment) => ({
          type: "comment",
          ...comment,
          postId: post.postId,
        })),
        ...post.likes.map((like) => ({
          type: "like",
          ...like,
          postId: post.postId,
        })),
        ...post.reposts.map((repost) => ({
          type: "repost",
          ...repost,
          postId: post.postId,
        })),
      ];

      // Group activities by date and by postId/activity type
      allActivities.forEach((activity) => {
        const date = new Date(activity.date).toLocaleDateString();

        if (!groups[date]) {
          groups[date] = {};
        }

        const key = `${activity.postId}-${activity.type}`;

        if (!groups[date][key]) {
          groups[date][key] = {
            activities: [],
            lastUser: null,
            lastActivityTime: activity.date,
            count: 0,
          };
        }

        groups[date][key].activities.push(activity);
        groups[date][key].lastUser = activity.user; // Track last user
        groups[date][key].lastActivityTime = activity.date; // Track time of last activity
        groups[date][key].count++; // Increment the count
      });

      return groups;
    }, {});
  };

  const renderActivities = () => {
    const activitiesByDate = groupByDate(activities);

    // Sort dates descending
    const sortedDates = Object.keys(activitiesByDate).sort((a, b) => {
      return new Date(b) - new Date(a);
    });

    return sortedDates.map((date) => {
      const activitiesByPost = activitiesByDate[date];

      // Sort activities by the last activity time within the date
      const sortedActivities = Object.values(activitiesByPost).sort(
        (a, b) => b.lastActivityTime - a.lastActivityTime
      );

      return (
        <div key={date}>
          <h6 className="text-muted">{date}</h6>

          {sortedActivities.map((activityGroup) => {
            const { activities, lastUser, count } = activityGroup;
            let activityMessage = "";

            // Create a message based on the activity type
            switch (activities[0].type) {
              case "comment":
                activityMessage =
                  count === 1
                    ? `${lastUser.name} commented on your post.`
                    : `${lastUser.name} and ${
                        count - 1
                      } others commented on your post.`;
                break;
              case "like":
                activityMessage =
                  count === 1
                    ? `${lastUser.name} liked your post.`
                    : `${lastUser.name} and ${
                        count - 1
                      } others liked your post.`;
                break;
              case "repost":
                activityMessage =
                  count === 1
                    ? `${lastUser.name} reposted your post.`
                    : `${lastUser.name} and ${
                        count - 1
                      } others reposted your post.`;
                break;
              default:
                break;
            }

            return (
              <Card className="mb-3" key={activityGroup.lastActivityTime}>
                <Card.Body className="d-flex align-items-center">
                  <Link to={`/${lastUser.uid}/${activities[0].postId}`}>
                    <Image
                      src={
                        lastUser.profilePhoto || "/images/defaultProfile.png"
                      }
                      roundedCircle
                      width="50"
                      height="50"
                      alt={`${lastUser.name}'s profile`}
                      className="me-3"
                    />
                  </Link>
                  <Link to={`/${lastUser.uid}/${activities[0].postId}`}>
                    <Card.Text>{activityMessage}</Card.Text>
                  </Link>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      );
    });
  };

  const renderFriendRequests = () => {
    return (
      <Row xs={1} sm={2} md={2} className="g-3">
        {friendRequests.map((request, idx) => (
          <Col key={idx}>
            <FriendRequestCard user={request} currentUser={uid} />
          </Col>
        ))}
      </Row>
    );
  };

  const renderGameRequests = () => {
    return (
      <div>
        {/* Add game request logic if needed */}
        <h6>No game requests yet.</h6>
      </div>
    );
  };

  return (
    <div>
      {/* Desktop View */}
      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />
          <Col
            md={7}
            className=" mx-auto px-0 px-md-3 vh-100 pb-5 pb-md-0"
            style={{ overflowY: "auto" }}
          >
            <Tab.Container defaultActiveKey="Activities">
              <Nav variant="tabs" className="d-flex justify-content-between">
                <Nav.Item className="flex-fill text-center">
                  <Nav.Link eventKey="Activities">Activities</Nav.Link>
                </Nav.Item>
                <Nav.Item className="flex-fill text-center">
                  <Nav.Link eventKey="FriendRequests">FriendRequests</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content className="mt-4">
                <Tab.Pane eventKey="Activities">{renderActivities()}</Tab.Pane>
                <Tab.Pane eventKey="FriendRequests">
                  {renderFriendRequests()}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
          <HomeRightSideBar />

          <AuthModal
            show={showAuthModal}
            handleClose={handleAuthModalClose}
            handleProfileEdit={handleProfileEditModalOpen}
            returnOnClose={true}
          />
          <ProfileEditModal
            show={showProfileEditModal}
            handleClose={handleProfileEditModalClose}
          />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

export default Notifications;
