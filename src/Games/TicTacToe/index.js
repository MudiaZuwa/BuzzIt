import { useEffect, useRef, useState } from "react";
import HandleButtonClick from "./HandleButtonClick";
import "./index.css";
import ComputerMove from "./ComputerMove";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser";
import { useParams } from "react-router-dom";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar";
import { Container, Row, Col, Card } from "react-bootstrap";
import HomeRightSideBar from "../../Components/HomeRightSideBar";
import JoinGameRoom from "./JoinGameRoom";
import initGame from "./app";
import updateDataInNode from "../../Functions/UpdateDataInNode";
import PlayerWinModal from "../../Components/PlayerWinModal";
import WaitingModal from "../../Components/WaitingModal";

const TicTacToe = () => {
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
  const [curPlayer, setCurPlayer] = useState("Player1");
  const [mode, setMode] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playersJoined, setPlayersJoined] = useState(false);
  const curPlayerRef = useRef(curPlayer);
  const [winnerName, setWinnerName] = useState(null);
  const [playerWins, setPlayerWins] = useState(null);
  const [dimensions, setDimensions] = useState({
    gameWidth: 0,
    gameHeight: 0,
    tileSize: 0,
  });

  const [tilesValue, setTileValue] = useState(() => {
    const newTilesValue = {};
    for (let i = 1; i <= 9; i++) {
      newTilesValue[`tile${i}`] = { value: "" };
    }
    return newTilesValue;
  });
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [showPlayerWinModal, setShowPlayerWinModal] = useState(false);

  const handleWaitingModalOpen = () => {
    if (!showWaitingModal) setShowWaitingModal(true);
  };
  const handleWaitingModalClose = () => setShowWaitingModal(false);

  const handlePlayerWinModalOpen = () => setShowPlayerWinModal(true);
  const handlePlayerWinModalClose = () => setShowPlayerWinModal(false);

  const tilesValueRef = useRef(tilesValue);

  const players = {
    Player1: "X",
    Player2: "O",
  };

  const getCanvasDimensions = () => {
    let newGameWidth = window.innerWidth < 371 ? window.innerWidth - 10 : 372;
    let newGameHeight = newGameWidth;
    if (window.innerHeight - 30 < newGameHeight) {
      newGameHeight = window.innerHeight - 40;
      newGameWidth = newGameHeight;
    }
    setDimensions({
      gameWidth: `${newGameWidth}px`,
      gameHeight: `${newGameHeight}px`,
      tileSize: (newGameWidth - 12) / 3,
    });
  };

  if (dimensions.gameWidth === 0 && dimensions.gameHeight === 0)
    getCanvasDimensions();

  window.addEventListener("resize", getCanvasDimensions);

  useEffect(() => {
    if (curPlayer === "Player2" && mode === "COMPUTER") {
      const computerNextMove = ComputerMove(tilesValue, players[curPlayer]);
      setTimeout(() => {
        HandleButtonClick(
          setTileValue,
          computerNextMove,
          players[curPlayer],
          setCurPlayer,
          setWinnerName,
          curPlayer
        );
      }, 1000);
    }
  }, [curPlayer]);

  useEffect(() => {
    let unsubscribeFromNode = null;
    if (!roomKey || !uid) return;
    if (roomKey === "Single") {
      setMode("COMPUTER");
      setPlayer("Player");
    } else {
      JoinGameRoom(
        uid,
        roomKey,
        tilesValue,
        "TicTacToe",
        setTileValue,
        setPlayersJoined,
        setCurPlayer,
        setPlayer
      ).then((unsubscribe) => {
        unsubscribeFromNode = unsubscribe;
        handleWaitingModalOpen();
      });
    }
    return () => {
      if (unsubscribeFromNode) {
        unsubscribeFromNode();
      }
      if (uid && roomKey) {
        const playerPath = `Games/TicTacToe/${roomKey}/players/${uid}`;
        updateDataInNode(playerPath, { online: false });
      }
    };
  }, [uid, roomKey]);

  const HandlePVPUpdate = (opponentMove, playerTurn) => {
    if (opponentMove === null || opponentMove === -1) return;

    HandleButtonClick(
      setTileValue,
      opponentMove,
      players[playerTurn],
      setCurPlayer,
      setWinnerName,
      curPlayerRef.current,
      roomKey,
      uid
    );
  };

  useEffect(() => {
    tilesValueRef.current = tilesValue;
    curPlayerRef.current = curPlayer;
  }, [tilesValue, curPlayer]);

  useEffect(() => {
    if (playersJoined) {
      if (!mode) {
        setMode("PVP");
        initGame(uid, roomKey, curPlayerRef, tilesValueRef, HandlePVPUpdate);
      }
      handleWaitingModalClose();
    } else if (
      mode === "PVP" &&
      !showWaitingModal &&
      !showPlayerWinModal &&
      !winnerName
    ) {
      handleWaitingModalOpen();
    }
  }, [playersJoined]);

  const handlePlayAgain = async () => {
    const newTilesValue = {};
    for (let i = 1; i <= 9; i++) {
      newTilesValue[`tile${i}`] = { value: "" };
    }

    handlePlayerWinModalClose();
    if (mode === "PVP") {
      const playerPath = `Games/TicTacToe/${roomKey}/players/${uid}`;
      const playerData = {
        online: true,
        tiles: newTilesValue,
        curPlayer: "Player1",
      };
      await updateDataInNode(playerPath, playerData);
      handleWaitingModalOpen();
    }
    setTileValue(newTilesValue);
    setWinnerName(null);
    setPlayerWins(null);
    setCurPlayer("Player1");
  };

  const setPlayerOffline = async () => {
    const playerPath = `Games/TicTacToe/${roomKey}/players/${uid}`;
    await updateDataInNode(playerPath, { online: false });
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
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />
          {/* Middle Content Area */}
          <Col
            md={7}
            className="d-flex mx-auto px-0 px-md-3 vh-100 pb-5 pb-md-0 
             justify-content-center align-content-center overflow-auto"
          >
            <Card
              style={{
                width: "min-content",
                height: "fit-content",
              }}
            >
              <Card.Body className="body">
                <div
                  className="gamebody"
                  style={{
                    width: dimensions.gameWidth,
                  }}
                >
                  <div className="title">
                    <div>
                      Turn: {curPlayer === "Player1" ? "Player 1" : "Player 2"}
                    </div>
                  </div>
                  <div
                    className="tiles"
                    style={{
                      width: dimensions.gameWidth,
                      height: dimensions.gameHeight,
                    }}
                  >
                    {Object.values(tilesValue).map((tile, index) => (
                      <div
                        className="tile"
                        key={index}
                        style={{
                          width: `${dimensions.tileSize}px`,
                          height: `${dimensions.tileSize}px`,
                          fontSize: `${dimensions.tileSize}px`,
                        }}
                        onClick={() => {
                          if (
                            (mode === "COMPUTER" && curPlayer === "Player2") ||
                            (mode === "PVP" && curPlayer !== player) ||
                            !mode
                          )
                            return;
                          HandleButtonClick(
                            setTileValue,
                            index,
                            players[curPlayer],
                            setCurPlayer,
                            setWinnerName,
                            curPlayer,
                            roomKey,
                            uid
                          );
                        }}
                      >
                        {tile.value}
                      </div>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Sidebar */}
          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
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

export default TicTacToe;
