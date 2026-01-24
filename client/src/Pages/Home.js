import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import PostCard from "../Components/Postcard.js";
import HomeLeftSideBar from "../Components/HomeLeftSideBar.js";
import HomeRightSideBar from "../Components/HomeRightSideBar.js";
import CreatePostform from "../Components/CreatePostform.js";
import ListenDataFromNode from "../Functions/ListenDataFromNode.js";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser.js";
import FetchDataFromNode from "../Functions/FetchDataFromNode.js";
import MobileBottomNavbar from "../Components/MobileBottomNavbar.js";
import { PostSkeletonList } from "../Components/SkeletonLoader.js";

const Home = () => {
  const [posts, setPosts] = useState(null);
  const { loggedIn, uid } = UseVerifyUser();

  // Function to update the posts state
  const updatePosts = (postsData) => {
    if (postsData) {
      const postDetailsPromises = Object.entries(postsData).map(
        async ([postId, post]) => {
          const postWithUser = await handleGetPostUser(postId, post);
          return postWithUser;
        }
      );

      Promise.all(postDetailsPromises).then(setPosts);
    } else {
      setPosts([]);
    }
  };

  const handleGetPostUser = async (postId, post) => {
    try {
      const userPath = `UsersDetails/${post.uid}`;
      const userData = await FetchDataFromNode(userPath);

      return {
        postId,
        ...post,
        username: userData.name,
        profilePic: userData.profilePhoto,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { postId, ...post };
    }
  };

  useEffect(() => {
    const postUnsubscribe = ListenDataFromNode(`Posts/`, updatePosts);

    return () => postUnsubscribe();
  }, []);

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
            className=" mx-auto px-0 px-md-3 vh-100 pb-5 pb-md-0"
            style={{ overflowY: "auto" }}
          >
            <div className="p-3">
              <h3>Feed</h3>
              <Card className="create-post-feed mb-4">
                <Card.Body>
                  <CreatePostform />
                </Card.Body>
              </Card>
              {!posts ? (
                <PostSkeletonList count={3} />
              ) : posts.length > 0 ? (
                posts.map((post, index) => (
                  <PostCard
                    key={post.postId || index}
                    post={post}
                    currentUserID={uid}
                  />
                ))
              ) : (
                <p className="text-center text-muted">
                  No posts yet. Be the first to share!
                </p>
              )}
            </div>
          </Col>

          {/* Right Sidebar */}
          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

export default Home;
