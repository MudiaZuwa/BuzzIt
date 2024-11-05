import React, { useEffect, useRef, useState } from "react";
import "./GameCanvas.module.css";
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
  const [players, setPlayers] = useState(false);
  const [playersJoined, setPlayersJoined] = useState(false);

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
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />

          {/* Middle Content Area */}
      <Col
            md={7}
            className=" mx-auto px-0 px-md-3"
            style={{ overflowY: "scroll", paddingBottom: "50px" }}
          >
            <Container fluid className="p-0" ref={gameBodyRef}>
              <div
                id="game-body"
                style={{
                  position: "relative",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <StartOptions gameRef={gameRef} />

                <canvas id="gameScreen" ref={canvasRef} />
              </div>
            </Container>
          </Col>

          {/* Right Sidebar */}
          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

export default Whot;
