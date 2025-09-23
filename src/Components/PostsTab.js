import React from "react";
import PostCard from "./Postcard.js";
import { Tab } from "react-bootstrap";

const PostsTab = ({ posts, currentUserID }) => (
  <Tab.Pane eventKey="posts">
    {posts.length > 0 ? (
      posts.map((post, index) => (
        <PostCard key={index} post={post} currentUserID={currentUserID} />
      ))
    ) : (
      <p>No posts available.</p>
    )}
  </Tab.Pane>
);

export default PostsTab;
