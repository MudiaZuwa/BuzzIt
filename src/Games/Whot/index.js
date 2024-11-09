import React, { useEffect, useRef, useState } from "react";
import GameManager from "./Game";
import StartOptions from "./StartOptions";
import { handleResize } from "./Functions/gameUtils";
import { useParams } from "react-router-dom";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser";
import JoinGameRoom from "./Functions/JoinGameRoom";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar";
import { Container, Row, Col, Card } from "react-bootstrap";
import HomeRightSideBar from "../../Components/HomeRightSideBar";
import updateDataInNode from "../../Functions/UpdateDataInNode";

const Whot = () => {
  const canvasRef = useRef(null);
  const gameBodyRef = useRef(null);
  const gameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  const [gameHeight, setGameHeight] = useState(window.innerHeight);
  const [isMobile, setIsMobile] = useState(null);
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
  const [players, setPlayers] = useState(false);
  const [playersJoined, setPlayersJoined] = useState(false);
  const [fullscreen, setFullscrren] = useState(false);
  const [isWinner, setIWinner] = useState(false);

  const handleFullscreenToggle = () => {
    setFullscrren((fullscreen) => !fullscreen);
  };

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (roomKey && uid) {
      let unsubscribeFromNode = null;
      JoinGameRoom(uid, roomKey, "Whot", setPlayers, setPlayersJoined).then(
        (unsubscribe) => (unsubscribeFromNode = unsubscribe)
      );

      return () => {
        if (unsubscribeFromNode) {
          unsubscribeFromNode();
        }
        if (uid && roomKey) {
          const playerPath = `Games/Whot/${roomKey}/players/${uid}`;
          updateDataInNode(playerPath, { true: false });
        }
      };
    }
  }, [uid, roomKey]);

  useEffect(() => {
    if (!gameBodyRef.current || isMobile === null) return;

    const resizeHandler = () =>
      handleResize(
        gameRef,
        canvasRef,
        gameBodyRef,
        setGameWidth,
        setGameHeight,
        isMobile
      );

    gameBodyRef.current.addEventListener("resize", resizeHandler);

    resizeHandler();

    return () => {
      if (gameBodyRef.current)
        gameBodyRef.current.removeEventListener("resize", resizeHandler);
    };
  }, [gameBodyRef, isMobile]);

  useEffect(() => {
    if (playersJoined) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const gameDimensions = {
        width: isMobile ? gameHeight : gameWidth,
        height: isMobile ? gameWidth : gameHeight,
      };

      if (!gameRef.current) {
        gameRef.current = new GameManager(
          ctx,
          canvas,
          gameDimensions,
          isMobile
        );
        gameRef.current.Start(players, roomKey, uid);
        gameRef.current.Cards.setIWinner = setIWinner;

        const animate = (timestamp) => {
          const deltaTime = timestamp - lastTimeRef.current;
          lastTimeRef.current = timestamp;
          if (!isMobile) ctx.clearRect(0, 0, gameWidth, gameHeight);
          else ctx.clearRect(0, 0, gameHeight, gameWidth);

          gameRef.current.animate(deltaTime);

          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animate);
      }
    }
  }, [gameWidth, gameHeight, players, playersJoined]);

  return (
    <div>
      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          {!fullscreen && <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />}

          {/* Middle Content Area */}
          <Col
            md={!fullscreen ? 7 : 12}
            className={` mx-auto px-0 vh-100 ${
              !fullscreen ? "pb-md-0 px-md-3 pb-5" : ""
            }`}
            style={{ overflowY: "auto" }}
          >
            <Container fluid className="p-0" ref={gameBodyRef}>
              <div
                id="game-body"
                className="position-relative d-flex flex-column vh-100 justify-content-center align-content-center "
              >
                <StartOptions gameRef={gameRef} />

                <canvas id="gameScreen" ref={canvasRef} />
                <i
                  className={`bi ${
                    !fullscreen ? "bi-fullscreen" : "bi-fullscreen-exit"
                  } `}
                  style={styles.fullscreen}
                  onClick={() => handleFullscreenToggle()}
                ></i>
              </div>
            </Container>
          </Col>

          {/* Right Sidebar */}
          {!fullscreen && <HomeRightSideBar />}
        </Row>
      </Container>
      {!fullscreen && <MobileBottomNavbar uid={uid} />}
    </div>
  );
};

export default Whot;

const styles = {
  fullscreen: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 1000,
    color: "grey",
  },
};
