import React, { useEffect, useRef, useState } from "react";
import GameManager from "./Game";
import { useParams } from "react-router-dom";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar";
import { Container, Row, Col, Card } from "react-bootstrap";
import HomeRightSideBar from "../../Components/HomeRightSideBar";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser";
import JoinGameRoom from "./JoinGameRoom";
import updateDataInNode from "../../Functions/UpdateDataInNode";
import styles from "./Styles";

const ChessGame = () => {
  const canvasRef = useRef(null);
  const gameManagerRef = useRef(null);
  const bodyRef = useRef(null);
  const [gameDimensions, setGameDimensions] = useState(null);
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
  const [playersJoined, setPlayersJoined] = useState(false);
  const [fullscreen, setFullscrren] = useState(false);

  const handleFullscreenToggle = () => {
    setFullscrren((fullscreen) => !fullscreen);
  };

  useEffect(() => {
    if (playersJoined) gameManagerRef.current.gameControl.restart();
  }, [playersJoined]);

  useEffect(() => {
    const customFont = new FontFace(
      "CustomFont",
      "url(/assets/Chess/PressStart2P-Regular.ttf)"
    );
    const canvas = canvasRef.current;

    const getCanvasDimensions = () => {
      if (!bodyRef.current) return;
      const divWidth = bodyRef.current.offsetWidth;
      const divHeight = bodyRef.current.offsetHeight;

      let newDimensions = divWidth - 10;
      if (divHeight - 30 < newDimensions) {
        newDimensions = divHeight - 40;
      }
      if (gameManagerRef.current)
        gameManagerRef.current.gameDimensions = newDimensions;
      setGameDimensions(newDimensions);
    };

    customFont.load().then(() => {
      document.fonts.add(customFont);
      getCanvasDimensions();
    });

    window.addEventListener("resize", getCanvasDimensions);

    return () => {
      window.removeEventListener("resize", getCanvasDimensions);
    };
  }, []);

  useEffect(() => {
    if (gameDimensions && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = gameDimensions;
      canvas.height = gameDimensions;

      const ctx = canvas.getContext("2d");

      if (!gameManagerRef.current) {
        gameManagerRef.current = new GameManager(ctx, canvas, gameDimensions);
      }

      const animate = () => {
        if (gameManagerRef.current) {
          gameManagerRef.current.animate();
        }
        requestAnimationFrame(animate);
      };
      animate();

      if (roomKey && uid && gameManagerRef.current) {
        let unsubscribeFromNode = null;
        JoinGameRoom(
          uid,
          roomKey,
          gameManagerRef,
          "Chess",
          setPlayersJoined
        ).then((unsubscribe) => (unsubscribeFromNode = unsubscribe));

        return () => {
          if (unsubscribeFromNode) {
            unsubscribeFromNode();
          }
          if (uid && roomKey) {
            const playerPath = `Games/Chess/${roomKey}/players/${uid}`;
            updateDataInNode(playerPath, { option: false });
          }
        };
      }
      return () => {
        cancelAnimationFrame(animate);
      };
    }
  }, [gameDimensions, roomKey, uid]);

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
            <div style={styles.body} ref={bodyRef}>
              <div style={styles.parent}>
                <div id="displayText" style={styles.displayText}>
                  {/* {displayText} */}
                </div>
                <canvas ref={canvasRef} id="gameScreen" />
              </div>
              <i
                className={`bi ${
                  !fullscreen ? "bi-fullscreen" : "bi-fullscreen-exit"
                } `}
                style={styles.fullscreen}
                onClick={() => handleFullscreenToggle()}
              ></i>
            </div>
          </Col>

          {/* Right Sidebar */}
          {!fullscreen && <HomeRightSideBar />}
        </Row>
      </Container>
      {!fullscreen && <MobileBottomNavbar uid={uid} />}
    </div>
  );
};

export default ChessGame;
