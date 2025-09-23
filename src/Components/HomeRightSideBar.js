import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  FormControl,
  Row,
} from "react-bootstrap";
import Search from "../Pages/Search.js";
import { Link, useNavigate } from "react-router-dom";
import ListenDataFromNode from "../Functions/ListenDataFromNode.js";

const HomeRightSideBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleGetSearchResult = async () => {
    const unsubscribeUsers = ListenDataFromNode("UsersDetails", (usersData) => {
      if (usersData) {
        const filteredUsers = Object.values(usersData)
          .filter((user) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((user) => ({
            ...user,
          }));

        setSearchResults(filteredUsers);
        setShowDropdown(filteredUsers.length > 0);
      }
    });
    return unsubscribeUsers;
  };

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      let unsubscribeUsers;

      const fetchData = async () => {
        unsubscribeUsers = await handleGetSearchResult();
      };

      fetchData();

      return () => {
        if (unsubscribeUsers) {
          unsubscribeUsers();
        }
      };
    }
  }, [searchQuery]);

  return (
    <Col md={3} className="d-none d-md-block bg-light vh-100 p-3">
      <Form
        className="d-flex position-relative border rounded"
        onSubmit={handleSearchSubmit}
        style={{ overflow: "hidden" }} // Keeps all elements within the border
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

        {showDropdown && (
          <Dropdown.Menu
            show
            className="w-100 position-absolute"
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              top: "100%",
              left: 0, // Ensures dropdown aligns with the form
              borderTop: "1px solid #ccc", // Separator for dropdown
            }}
          >
            {searchResults.map((result, index) => (
              <PeopleCard user={result} key={index} />
            ))}
          </Dropdown.Menu>
        )}
      </Form>
    </Col>
  );
};

export default HomeRightSideBar;

const PeopleCard = ({ user }) => (
  <div>
    <div>
      <Row className="align-items-center mx-0">
        <Col md={2} className="d-flex justify-content-center">
          <Link to={`/${user.id}`}>
            <img
              src={user.profilePhoto || "/images/defaultProfile.png"}
              alt={`${user.name}'s profile`}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Link>
        </Col>
        <Col md={10}>
          <Link
            to={`/${user.id}`}
            style={{ textDecoration: "none", color: "black" }}
          >
            <h6 className="m-0 text-truncate">{user.name}</h6>
          </Link>
        </Col>
      </Row>
    </div>
  </div>
);
