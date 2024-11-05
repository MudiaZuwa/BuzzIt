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

const ChessGame = () => {
  const canvasRef = useRef(null);
  const gameManagerRef = useRef(null);
  const bodyRef = useRef(null);
  const [gameDimensions, setGameDimensions] = useState(null);
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
  const [playersJoined, setPlayersJoined] = useState(false);

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
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />

          {/* Middle Content Area */}
      <Col
            md={7}
            className=" mx-auto px-0 px-md-3"
            style={{ overflowY: "scroll", paddingBottom: "50px" }}
          >
            <div style={styles.body} ref={bodyRef}>
              <div style={styles.parent}>
                <div id="displayText" style={styles.displayText}>
                  {/* {displayText} */}
                </div>
                <canvas ref={canvasRef} id="gameScreen" />
              </div>
            </div>
          </Col>

          {/* Right Sidebar */}
          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

// Inline styles
const styles = {
  body: {
    width: "100%",
    height: "100vh",
    backgroundColor: "#7c4c3e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    fontFamily: "CustomFont, sans-serif",
  },
  menu: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  optionsBody: {
    display: "flex",
  },
  roomName: {
    fontSize: "2vmax",
    marginBottom: "0.5vmax",
    display: "block",
    fontStyle: "inherit",
  },
  options: {
    fontSize: "1.2vmax",
    fontFamily: "CustomFont, sans-serif",
  },
  displayText: {
    position: "absolute",
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
  },
  parent: {
    position: "relative",
    display: "inline-block",
  },
};

export default ChessGame;
