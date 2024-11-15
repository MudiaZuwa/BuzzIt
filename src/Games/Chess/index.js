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
import WaitingModal from "../../Components/WaitingModal";
import PlayerWinModal from "../../Components/PlayerWinModal";

const ChessGame = () => {
  const canvasRef = useRef(null);
  const gameManagerRef = useRef(null);
  const bodyRef = useRef(null);
  const [gameDimensions, setGameDimensions] = useState(null);
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
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
    if (playersJoined) {
      gameManagerRef.current.gameControl.restart();
      handleWaitingModalClose();
    } else if (!showPlayerWinModal) {
      handleWaitingModalOpen();
    }
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
        ).then((unsubscribe) => {
          handleWaitingModalOpen();
          unsubscribeFromNode = unsubscribe;
        });

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

  const handlePlayAgain = async () => {
    const newTilesValue = {};
    for (let i = 1; i <= 9; i++) {
      newTilesValue[`tile${i}`] = { value: "" };
    }

    handlePlayerWinModalClose();
    const playerPath = `Games/Chess/${roomKey}/players/${uid}`;
    gameManagerRef.current.Pieces.Restart();
    const player = gameManagerRef.current.player;
    let playerPieces = gameManagerRef.current.Pieces.playerPieces[player];
    const playerData = {
      online: true,
      pieces: playerPieces,
      playerTurn: "Player1",
    };
    await updateDataInNode(playerPath, playerData);
    handleWaitingModalOpen();

    setWinnerName(null);
    setPlayerWins(null);
    // gameManagerRef.current.gameControl.restart();
  };

  const setPlayerOffline = async () => {
    const playerPath = `Games/Chess/${roomKey}/players/${uid}`;
    await updateDataInNode(playerPath, { online: false });
    const player = gameManagerRef.current.player;
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

export default ChessGame;
