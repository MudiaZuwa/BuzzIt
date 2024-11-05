import React, { useState } from "react";
import { Row, Col, Image, Nav, Tab, Card } from "react-bootstrap";

const FriendsSection = () => {
  const [activeTab, setActiveTab] = useState("all"); // Toggle between all and mutual friends

  const mutualFriends = friendsData.slice(0, 2); // Example mutual friends

  return (
    <Tab.Container defaultActiveKey="all">
      <Nav variant="pills" className="mb-3">
        <Nav.Item>
          <Nav.Link eventKey="all" onClick={() => setActiveTab("all")}>
            All Friends
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="mutual" onClick={() => setActiveTab("mutual")}>
            Mutual Friends
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Tab.Content>
        <Tab.Pane eventKey="all">
          <Row>
            {friendsData.map((friend, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="text-center">
                  <Card.Body>
                    <Image
                      src={friend.profilePic || "/images/defaultProfile.png"}
                      roundedCircle
                      width="80"
                      height="80"
                      className="mb-3"
                    />
                    <Card.Text>{friend.name}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab.Pane>

        <Tab.Pane eventKey="mutual">
          <Row>
            {mutualFriends.map((friend, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="text-center">
                  <Card.Body>
                    <Image
                      src={friend.profilePic || "/images/defaultProfile.png"}
                      roundedCircle
                      width="80"
                      height="80"
                      className="mb-3"
                    />
                    <Card.Text>{friend.name}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};

export default FriendsSection;
