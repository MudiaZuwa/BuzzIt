import React, { useEffect, useRef, useState } from "react";
import GameManager from "./Game.js";
import StartOptions from "./StartOptions.js";
import { handleResize } from "./Functions/gameUtils.js";
import { useParams } from "react-router-dom";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser.js";
import JoinGameRoom from "./Functions/JoinGameRoom.js";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar.js";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar.js";
import { Container, Row, Col, Card } from "react-bootstrap";
import HomeRightSideBar from "../../Components/HomeRightSideBar.js";
import updateDataInNode from "../../Functions/UpdateDataInNode.js";
import PlayerWinModal from "../../Components/PlayerWinModal.js";
import WaitingModal from "../../Components/WaitingModal.js";

const Whot = () => {
  const canvasRef = useRef(null);
  const gameBodyRef = useRef(null);
  const gameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [gameWidth, setGameWidth] = useState(null);
  const [gameHeight, setGameHeight] = useState(null);
  const [isMobile, setIsMobile] = useState(null);
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
  const [players, setPlayers] = useState(null);
  const [playersJoined, setPlayersJoined] = useState(false);
  const [fullscreen, setFullscrren] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [showPlayerWinModal, setShowPlayerWinModal] = useState(false);
  const [winnerName, setWinnerName] = useState(null);
  const [playerWins, setPlayerWins] = useState(null);

  const handleWaitingModalOpen = () => setShowWaitingModal(true);
  const handleWaitingModalClose = () => setShowWaitingModal(false);

  const handlePlayerWinModalOpen = () => setShowPlayerWinModal(true);
  const handlePlayerWinModalClose = () => setShowPlayerWinModal(false);

  const handleFullscreenToggle = () => {
    setFullscrren((fullscreen) => !fullscreen);
  };

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (roomKey && uid && gameRef.current) {
      let unsubscribeFromNode = null;
      JoinGameRoom(
        uid,
        roomKey,
        "Whot",
        setPlayers,
        setPlayersJoined,
        gameRef
      ).then((unsubscribe) => {
        handleWaitingModalOpen();
        unsubscribeFromNode = unsubscribe;
      });

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
    if (!gameWidth || !gameHeight) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const gameDimensions = {
      width: isMobile ? gameHeight : gameWidth,
      height: isMobile ? gameWidth : gameHeight,
    };

    if (!gameRef.current && isMobile !== null) {
      gameRef.current = new GameManager(ctx, canvas, gameDimensions, isMobile);
      gameRef.current.Cards.setWinnerName = setWinnerName;

      const animate = (timestamp) => {
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;
        if (!gameRef.current.isLandScape)
          ctx.clearRect(0, 0, gameWidth, gameHeight);
        else ctx.clearRect(0, 0, gameHeight, gameWidth);

        gameRef.current.animate(deltaTime);

        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animate);
    }
  }, [gameWidth, gameHeight, isMobile]);

  useEffect(() => {
    if (playersJoined && players) {
      if (!gameRef.current.started)
        gameRef.current.Start(players, roomKey, uid);
      handleWaitingModalClose();
    } else if (!showPlayerWinModal) {
      handleWaitingModalOpen();
    }
  }, [playersJoined, players]);

  const handlePlayAgain = async () => {
    const playerPath = `Games/Whot/${roomKey}/players/${uid}`;

    await updateDataInNode(playerPath, { online: false });
    await updateDataInNode(`Games/Whot/${roomKey}/data`, {
      playerTurn: "Player1",
    });
    handlePlayerWinModalClose();
    handleWaitingModalOpen();

    setWinnerName(null);
    setPlayerWins(null);
    gameRef.current.started = false;
  };

  const setPlayerOffline = async () => {
    const playerPath = `Games/Whot/${roomKey}/players/${uid}`;
    await updateDataInNode(playerPath, { online: false });
    const player = gameRef.current.player;
    if (winnerName === player) setPlayerWins(true);
    else handlePlayerWinModalOpen();
  };

  useEffect(() => {
    if (winnerName) {
      setPlayerOffline();
    }
  }, [winnerName]);

  useEffect(() => {
    if (playerWins) handlePlayerWinModalOpen();
  }, [playerWins]);

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
      <WaitingModal
        show={showWaitingModal}
        onClose={handleWaitingModalClose}
        playerJoined={playersJoined}
      />
      <PlayerWinModal
        show={showPlayerWinModal}
        onPlayAgain={handlePlayAgain}
        winnerName={winnerName}
        playerWins={playerWins}
      />
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
