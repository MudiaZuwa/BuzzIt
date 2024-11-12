import React, { useEffect, useRef, useState } from "react";
import Game from "./game";
import "./GameCanvas.module.css";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar";
import { Container, Row, Col } from "react-bootstrap";
import HomeRightSideBar from "../../Components/HomeRightSideBar";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser";
import styles from "./Styles";

const BallFall = () => {
  const { uid, loggedIn } = UseVerifyUser();
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  const [gameHeight, setGameHeight] = useState(window.innerHeight);
  const [fullscreen, setFullscrren] = useState(false);

  const handleFullscreenToggle = () => {
    setFullscrren((fullscreen) => !fullscreen);
  };

  useEffect(() => {
    const handleResize = () => {
      setGameWidth(window.innerWidth);
      setGameHeight(window.innerHeight);
      if (gameRef.current) {
        gameRef.current.gameWidth = window.innerWidth;
        gameRef.current.gameHeight = window.innerHeight;
      }
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!gameRef.current) {
      // Initialize the game object
      gameRef.current = new Game(gameWidth, gameHeight);

      const animate = (timestamp) => {
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;

        ctx.clearRect(0, 0, gameWidth, gameHeight);
        if (canvasRef.current) {
          gameRef.current.update(deltaTime);
          gameRef.current.draw(ctx);
        }

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animate);
      };
    }
  }, [gameWidth, gameHeight]);

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
            <Container fluid className="p-0">
              <div id="game-body" style={styles.gameBody}>
                <div id="head" style={styles.header}>
                  <div className="d-flex align-items-center">
                    <img
                      src="/assets/BallFall/pngwing.com.png"
                      alt="Lives"
                      id="lives_img"
                      style={styles.livesImage}
                    />
                    <p id="lives" style={styles.livesText}>
                      3
                    </p>
                  </div>
                  <div className="d-flex align-items-center">
                    <img
                      src="/assets/BallFall/windows-media-player-pause-button.png"
                      alt="Pause"
                      id="pause_img"
                      style={styles.pauseImage}
                    />
                    <p id="score-label" style={styles.scoreLabel}>
                      Score:{" "}
                      <span id="score" style={styles.score}>
                        0
                      </span>
                    </p>
                  </div>
                </div>

                {/* Touch areas and game canvas */}
                <div className="d-flex h-100" style={{ overflowY: "hidden" }}>
                  <div id="left_touch" style={styles.touchArea}></div>
                  <div id="center_touch" style={styles.touchArea}></div>
                  <div id="right_touch" style={styles.touchArea}></div>
                </div>

                {/* Game canvas */}
                <canvas
                  id="gameScreen"
                  ref={canvasRef}
                  style={styles.gameScreen}
                />
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

export default BallFall;
