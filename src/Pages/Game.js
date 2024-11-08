import React, { useEffect, useState } from "react";
import HomeLeftSideBar from "../Components/HomeLeftSideBar";
import MobileBottomNavbar from "../Components/MobileBottomNavbar";
import { Container, Row, Col, Tab, Tabs, Card } from "react-bootstrap";
import UseVerifyUser from "../CustomUseHooks/UseVerifyUser";
import HomeRightSideBar from "../Components/HomeRightSideBar";
import { Link } from "react-router-dom";
import { gameData } from "../Games/GameData";
import FetchDataFromNode from "../Functions/FetchDataFromNode";
import SelectPlayersModal from "../Components/SelectPlayersModal";
import AuthModal from "../Auth/AuthModal";
import ProfileEditModal from "../Components/ProfileEditModal";

const Game = () => {
  const { uid, loggedIn, isPending } = UseVerifyUser();
  const [friendsList, setFriendsList] = useState([]);
  const [selectFriendModalShow, setSelectFriendModalShow] = useState(false);
  const [game, setGame] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

  const handleProfileEditModalOpen = () => setShowProfileEditModal(true);
  const handleProfileEditModalClose = () => setShowProfileEditModal(false);

  const handleAuthModalOpen = () => setShowAuthModal(true);
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const handleSelectFriendModalOpen = () => setSelectFriendModalShow(true);
  const handleSelectFriendModalClose = () => setSelectFriendModalShow(false);

  useEffect(() => {
    if (loggedIn) checkUserDetails();
  }, [loggedIn]);

  const checkUserDetails = () => {
    const nodePath = `UsersDetails/${uid}`;
    FetchDataFromNode(nodePath)
      .then((data) => {
        if (!data) return;
        else if (!data.name) handleProfileEditModalOpen();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const fetchFriendsList = async () => {
    const friendsData = await FetchDataFromNode(`friend/${uid}/Friends`);
    if (!friendsData) return [];

    const friendsArray = await Promise.all(
      Object.keys(friendsData).map(async (friendId) => {
        const friendDetails = await FetchDataFromNode(
          `UsersDetails/${friendId}`
        );
        return friendDetails
          ? {
              id: friendId,
              name: friendDetails.name,
              profilePhoto: friendDetails.profilePhoto,
            }
          : null;
      })
    );

    return friendsArray.filter(Boolean);
  };

  useEffect(() => {
    const loadFriends = async () => setFriendsList(await fetchFriendsList(uid));
    if (uid) loadFriends();
  }, [uid]);

  useEffect(() => {
    if (isPending || !game) return;
    if (!loggedIn) handleAuthModalOpen();
    else handleSelectFriendModalOpen();
  }, [game, isPending]);

  return (
    <div>
      <Container fluid>
        <Row>
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />

          {/* Middle Content Area */}
          <Col
            md={7}
            className="vh-100 mx-auto px-0 px-md-3 vh-100 pb-5 pb-md-0"
            style={{ overflowY: "auto" }}
          >
            <Tabs id="games-tabs" className="mb-3 w-100">
              <Tab eventKey="Single-Player" title="Single-Player">
                <div className="d-flex flex-column w-100">
                  {gameData.SinglePlayer.map((game) => (
                    <Link
                      key={game.name}
                      to={`/Games/${game.path}/Single`}
                      className="game-card w-100 mb-3"
                      style={{ textDecoration: "none" }}
                    >
                      <Card className=" bg-light w-100">
                        <Card.Body>
                          <Card.Title>{game.name}</Card.Title>
                        </Card.Body>
                      </Card>
                    </Link>
                  ))}
                </div>
              </Tab>

              <Tab eventKey="Multi-Player" title="Multi-Player">
                <div className="d-flex flex-column w-100">
                  {gameData.MultiPlayer.map((game) => (
                    <div
                      key={game.name}
                      onClick={() => setGame(game)}
                      className="game-card w-100 mb-3"
                      style={{ cursor: "pointer" }}
                    >
                      <Card className=" bg-light w-100">
                        {/* <Card.Img
                          src={game.imgSrc}
                          alt={game.name}
                          style={{ width: "100%" }}
                        /> */}
                        <Card.Body>
                          <Card.Title>{game.name}</Card.Title>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              </Tab>
            </Tabs>
          </Col>

          {/* Right Sidebar */}
          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
      <SelectPlayersModal
        friendsList={friendsList}
        show={selectFriendModalShow}
        handleClose={handleSelectFriendModalClose}
        Game={game}
        UID={uid}
      />
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
    </div>
  );
};

export default Game;
