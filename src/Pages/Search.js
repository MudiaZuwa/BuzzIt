import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  Button,
  Col,
  Container,
  Row,
  Tab,
  Card,
  Tabs,
  Nav,
} from "react-bootstrap";
import MobileBottomNavbar from "../Components/MobileBottomNavbar.js";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser.js";
import HomeLeftSideBar from "../Components/HomeLeftSideBar.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FetchDataFromNode from "../Functions/FetchDataFromNode.js";
import ListenDataFromNode from "../Functions/ListenDataFromNode.js";
import PostCard from "../Components/Postcard.js";

const Search = () => {
  const location = useLocation();
  const { loggedIn, uid } = UseVerifyUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [searchResults, setSearchResults] = useState({
    People: [],
    Posts: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");

    if (query) {
      setSearchQuery(query);
      const cleanup = getSearchResult(query);
      return cleanup;
    }
  }, [location.search, uid]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const checkIfFriend = (userId, friendsData) => {
    if (friendsData) {
      const currentUserFriends = Object.keys(friendsData).includes(userId);
      return currentUserFriends;
    } else return false;
  };

  const updatePosts = async (postsData) => {
    if (postsData) {
      const postDetailsPromises = postsData.map(async ([postId, post]) => {
        const postWithUser = await handleGetPostUser(postId, post);
        return postWithUser;
      });
      return await Promise.all(postDetailsPromises);
    } else {
      return [];
    }
  };

  const handleGetPostUser = async (postId, post) => {
    try {
      const userPath = `UsersDetails/${post.uid}`;
      const userData = await FetchDataFromNode(userPath);
      return {
        postId,
        ...post,
        username: userData?.name,
        profilePic: userData?.profilePhoto,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { postId, ...post };
    }
  };

  const getSearchResult = (searchValue) => {
    const unsubscribes = [];

    const unsubscribeUsers = ListenDataFromNode("UsersDetails", (usersData) => {
      if (usersData) {
        if (uid) {
          const unsubscribeFriends = ListenDataFromNode(
            `friend/${uid}/Friends`,
            (friendsData) => {
              const filteredUsers = Object.values(usersData)
                .filter((user) =>
                  user.name?.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((user) => ({
                  ...user,
                  isFriend: checkIfFriend(user.id, friendsData),
                }));
              setSearchResults((previousResults) => ({
                ...previousResults,
                People: filteredUsers,
              }));
            }
          );
          unsubscribes.push(unsubscribeFriends);
        } else {
          const filteredUsers = Object.values(usersData).filter((user) =>
            user.name?.toLowerCase().includes(searchValue.toLowerCase())
          );
          setSearchResults((previousResults) => ({
            ...previousResults,
            People: filteredUsers,
          }));
        }
      }
    });
    unsubscribes.push(unsubscribeUsers);

    const unsubscribePosts = ListenDataFromNode("Posts", async (postsData) => {
      if (postsData) {
        const validPosts = Object.entries(postsData).filter(([postId, post]) =>
          post.postText.toLowerCase().includes(searchValue.toLowerCase())
        );

        const updatedPosts = await updatePosts(validPosts);
        setSearchResults((previousResults) => ({
          ...previousResults,
          Posts: updatedPosts,
        }));
      }
    });
    unsubscribes.push(unsubscribePosts);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  };

  return (
    <div>
      {/* Desktop View */}
      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />

          {/* Middle Content Area */}
          <Col
            md={7}
            className=" mx-auto px-1 px-md-3 vh-100 pb-5 pb-md-0"
            style={{ overflowY: "auto" }}
          >
            <div className="pt-3 px-3">
              <Form
                className="d-flex align-items-center border rounded"
                onSubmit={handleSearchSubmit}
                style={{ overflow: "hidden" }} // Ensure the border includes everything
              >
                <FormControl
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 flex-grow-1"
                  style={{ boxShadow: "none" }} 
                />
                <Button
                  variant="outline-success"
                  type="submit"
                  className="border-0"
                  style={{
                    borderLeft: "1px solid #ccc", 
                  }}
                >
                  <i className="bi bi-search"></i>
                </Button>
              </Form>
              <Tab.Container
                activeKey={activeTab}
                onSelect={(selectedTab) => setActiveTab(selectedTab)}
              >
                <Nav variant="tabs" className="d-flex justify-content-between">
                  <Nav.Item className="flex-fill text-center">
                    <Nav.Link eventKey="All">All</Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="flex-fill text-center">
                    <Nav.Link eventKey="People">People</Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="flex-fill text-center">
                    <Nav.Link eventKey="Posts">Posts</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content className="mt-4">
                  {/* All Tab */}
                  <Tab.Pane eventKey="All">
                    {/* People section */}

                    {searchResults.People.length > 0 && (
                      <div className="mb-4">
                        <h5>People</h5>
                        {searchResults.People.slice(0, 3).map((user, index) => (
                          <PeopleCard key={index} user={user} />
                        ))}
                      </div>
                    )}
                    {searchResults.People.length > 3 && (
                      <div className="text-end">
                        <Button
                          variant="link"
                          style={{ textDecoration: "none" }}
                          onClick={() => setActiveTab("People")}
                        >
                          View All
                        </Button>
                      </div>
                    )}

                    {/* Posts section */}

                    {searchResults.Posts.length > 0 && (
                      <div>
                        <h5>Posts</h5>
                        {searchResults.Posts.map((post, index) => (
                          <PostCard
                            key={index}
                            post={post}
                            currentUserID={uid}
                          />
                        ))}
                      </div>
                    )}
                  </Tab.Pane>

                  {/* People Tab */}
                  <Tab.Pane eventKey="People">
                    {searchResults.People.length > 0 &&
                      searchResults.People.map((user, index) => (
                        <PeopleCard key={index} user={user} />
                      ))}
                  </Tab.Pane>

                  {/* Posts Tab */}
                  <Tab.Pane eventKey="Posts">
                    {searchResults.Posts.length > 0 &&
                      searchResults.Posts.map((post, index) => (
                        <PostCard key={index} post={post} currentUserID={uid} />
                      ))}
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </Col>

          {/* Right Sidebar */}
          <Col md={3} className="d-none d-md-block bg-light vh-100 p-3"></Col>
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

export default Search;

const PeopleCard = ({ user }) => (
  <Card style={{ marginBottom: "12px" }}>
    <Card.Body>
      <Row className="align-items-center">
        <Col xs={3} md={2} className="d-flex justify-content-center">
          <Link to={`/${user.id}`}>
            <img
              src={user.profilePhoto || "/images/defaultProfile.png"}
              alt={`${user.name}'s profile`}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Link>
        </Col>
        <Col xs={6} md={8}>
          <Link
            to={`/${user.id}`}
            style={{ textDecoration: "none", color: "black" }}
          >
            <h6 className="m-0">{user.name}</h6>
          </Link>
        </Col>
        <Col xs={3} md={2} className="text-end">
          {user.isFriend && (
            <Link to={`/messages/${user.id}`}>
              <i
                className="bi bi-envelope-fill"
                style={{ fontSize: "1.5rem" }}
              ></i>
            </Link>
          )}
        </Col>
      </Row>
    </Card.Body>
  </Card>
);
