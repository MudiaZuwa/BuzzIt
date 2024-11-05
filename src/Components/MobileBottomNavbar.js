import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const MobileBottomNavbar = ({ uid }) => {
  return (
    <Navbar
      fixed="bottom"
      bg="light"
      className="d-md-none justify-content-between mx-auto px-0"
      style={{ marginTop: "50px" }}
    >
      <Container>
        <Nav className="d-flex w-100 justify-content-between">
          <Nav.Link as={Link} to={`/`}>
            <i
              className="bi bi-house-door-fill"
              style={{ fontSize: "1.5rem" }}
            ></i>
          </Nav.Link>

          <Nav.Link as={Link} to="/search">
            <i className="bi bi-search" style={{ fontSize: "1.5rem" }}></i>
          </Nav.Link>

          <Nav.Link as={Link} to={`/${uid}`}>
            <i className="bi bi-people-fill" style={{ fontSize: "1.5rem" }}></i>
          </Nav.Link>

          <Nav.Link as={Link} to={`/messages/`}>
            <i
              className="bi bi-envelope-fill"
              style={{ fontSize: "1.5rem" }}
            ></i>
          </Nav.Link>

          <Nav.Link as={Link} to="/Games">
            <i className="bi bi-controller" style={{ fontSize: "1.5rem" }}></i>
          </Nav.Link>

          <Nav.Link as={Link} to={`#`}>
            <i className="bi bi-gear-fill" style={{ fontSize: "1.5rem" }}></i>
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MobileBottomNavbar;
