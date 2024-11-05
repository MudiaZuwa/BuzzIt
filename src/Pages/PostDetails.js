import React, { useState, useEffect } from "react";
import { Button, Form, Container, Row, Col, Card } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import PostCard from "../Components/Postcard";
import CreatePostForm from "../Components/CreatePostform";
import ListenDataFromNode from "../Functions/ListenDataFromNode";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser";
import HomeLeftSideBar from "../Components/HomeLeftSideBar";
import HomeRightSideBar from "../Components/HomeRightSideBar";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import CommentCard from "../Components/CommentCard";
import MobileBottomNavbar from "../Components/MobileBottomNavbar";

const PostDetails = () => {
  const { userId, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const { uid: currentUserID, loggedIn } = UseVerifyUser();

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

  const updatePostDetails = async (postData) => {
    if (postData) {
      const postWithUser = await handleGetPostUser(postId, postData);
      setPost(postWithUser);
      setComments(postWithUser.comments || []);
    } else {
      setPost(null);
      setComments([]);
    }
  };

  // UseEffect to fetch post details
  useEffect(() => {
    const unsubscribe = ListenDataFromNode(
      `Posts/${postId}`,
      updatePostDetails
    );
    return () => unsubscribe(); // Clean up the listener on component unmount
  }, [postId]);

  return (
    <div>
      {/* Desktop View */}
      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          <HomeLeftSideBar loggedIn={loggedIn} uid={currentUserID} />
          <Col
            md={7}
            className=" mx-auto px-0 px-md-3"
            style={{ overflowY: "auto", paddingBottom: "50px" }}
          >
            <Container className="mt-4">
              <Row className="mb-4">
                <Col xs="auto">
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline-primary"
                  >
                    <i className="bi bi-arrow-left"></i> Back
                  </Button>
                </Col>
                <Col>
                  <h2 className="text-left">Post</h2>
                </Col>
              </Row>

              {post ? (
                <PostCard post={post} currentUserID={currentUserID} />
              ) : (
                <p>Loading post...</p>
              )}

              {error && <p className="text-danger">{error}</p>}

              <Card className="create-post-feed">
                <Card.Body>
                  <CreatePostForm
                    commentDetails={{ comments, postId, userId }}
                  />
                </Card.Body>
              </Card>

              {/* List of comments */}
              <Row className="mt-2 mx-auto px-0 ">
                <h4>Comments</h4>
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <CommentCard
                      commentIndex={index}
                      comment={comment}
                      postID={postId}
                      currentUserID={currentUserID}
                      key={index}
                    />
                  ))
                ) : (
                  <p>No comments yet. Be the first to comment!</p>
                )}
              </Row>
            </Container>
          </Col>
          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={currentUserID} />
    </div>
  );
};

export default PostDetails;
