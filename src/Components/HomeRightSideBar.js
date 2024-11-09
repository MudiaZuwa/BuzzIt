import React, { useRef } from "react";
import { Button, Col, Form, FormControl } from "react-bootstrap";
import Search from "../Pages/Search";
import { useNavigate } from "react-router-dom";

const HomeRightSideBar = () => {
  const searchRef = useRef();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchValue = searchRef.current.value;

    if (searchValue) {
      navigate(`/search?query=${encodeURIComponent(searchValue)}`);
    }
  };
  return (
    <Col md={3} className="d-none d-md-block bg-light vh-100 p-3">
      <Form className="d-flex" onSubmit={handleSearchSubmit}>
        <FormControl
          type="search"
          placeholder="Search"
          aria-label="Search"
          ref={searchRef}
        />
        <Button variant="outline-success" type="submit">
          <i className="bi bi-search"></i>
        </Button>
      </Form>
    </Col>
  );
};

export default HomeRightSideBar;
