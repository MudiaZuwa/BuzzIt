import React from "react";
import { Col } from "react-bootstrap";
import Search from "../Pages/Search";

const HomeRightSideBar = () => {
  return (
    <Col md={3} className="d-none d-md-block bg-light vh-100 p-3">
      <Search />
    </Col>
  );
};

export default HomeRightSideBar;
