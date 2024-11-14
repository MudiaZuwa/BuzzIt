import React, { useEffect, useRef, useState } from "react";
import Game from "./game";
import { Container, Row, Col } from "react-bootstrap";
import "./GameCanvas.module.css";
import styles from "./Style";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar";
import HomeRightSideBar from "../../Components/HomeRightSideBar";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser";

const BrickBreak = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  const [gameHeight, setGameHeight] = useState(window.innerHeight);
  const [isMobile, setIsMobile] = useState(null);
  const { uid, loggedIn } = UseVerifyUser();
  const [fullscreen, setFullscrren] = useState(false);

  const handleFullscreenToggle = () => {
    setFullscrren((fullscreen) => !fullscreen);
  };

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  // Resize canvas dynamically
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      setGameWidth(newWidth);
      setGameHeight(newHeight);

      if (gameRef.current) {
        if (isMobile && gameHeight > gameWidth) {
          gameRef.current.gameWidth = newHeight;
          gameRef.current.gameHeight = newWidth;
        } else {
          gameRef.current.gameWidth = newWidth;
          gameRef.current.gameHeight = newHeight;
        }
      }

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = newWidth;
        canvas.height = newHeight;

        if (isMobile && gameHeight > gameWidth) {
          ctx.save();
          ctx.translate(newWidth, 0);
          ctx.rotate(Math.PI / 2);
        } else {
          ctx.restore();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    console.log(gameHeight);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!gameRef.current && isMobile !== null) {
      gameRef.current = new Game(gameWidth, gameHeight, isMobile);
      console.log(isMobile);

      const animate = (timestamp) => {
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;
        if (gameHeight > gameWidth && isMobile)
          ctx.clearRect(0, 0, gameHeight, gameWidth);
        else ctx.clearRect(0, 0, gameWidth, gameHeight);
        if (canvasRef.current) gameRef.current.update(deltaTime);
        if (canvasRef.current) gameRef.current.draw(ctx);

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animate);
      };
    }
  }, [isMobile]);

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
                {/* Header for game info */}
                <div id="head" style={styles.header}>
                  <div className="d-flex align-items-center">
                    <img
                      src="/assets/BrickBreak/pngwing.com.png"
                      alt="Lives"
                      id="lives_img"
                      style={styles.livesImage}
                    />
                    <p id="lives" className="m-0">
                      3
                    </p>
                  </div>
                  <img
                    src="/assets/BrickBreak/windows-media-player-pause-button.png"
                    alt="Pause"
                    id="pause_img"
                    style={styles.pauseImage}
                  />
                </div>

                {/* Touch areas */}
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

                {/* Fullscreen Icon */}
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

export default BrickBreak;
