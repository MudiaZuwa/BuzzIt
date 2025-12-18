import { useEffect, useRef, useState } from "react";
import HandleButtonClick from "./HandleButtonClick.js";
import HintTiles from "./HintTiles.js";
import HandleHintClick from "./HandleHintClick.js";
import "./index.css";
import ComputerMove from "./ComputerMove.js";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser.js";
import { useParams } from "react-router-dom";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar.js";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar.js";
import { Container, Row, Col, Card } from "react-bootstrap";
import HomeRightSideBar from "../../Components/HomeRightSideBar.js";
import JoinGameRoom from "./JoinGameRoom.js";
import initGame from "./app.js";
import updateDataInNode from "../../Functions/UpdateDataInNode.js";
import WaitingModal from "../../Components/WaitingModal.js";
import PlayerWinModal from "../../Components/PlayerWinModal.js";

const SuperTicTacToe = () => {
  const { uid, loggedIn } = UseVerifyUser();
  const { roomKey } = useParams();
  const [curSuperTile, setCurSuperTile] = useState(null);
  const [curPlayer, setCurPlayer] = useState("Player1");
  const [player, setPlayer] = useState(null);
  const [displayHint, setDisplayHint] = useState(false);
  const [mode, setMode] = useState(null);
  const [playersJoined, setPlayersJoined] = useState(false);
  const curSuperTileRef = useRef(curSuperTile);
  const curPlayerRef = useRef(curPlayer);
  const [winnerName, setWinnerName] = useState(null);
  const [playerWins, setPlayerWins] = useState(null);

  const [dimensions, setdimensions] = useState(() => {
    return {
      gameWidth: 0,
      gameHeight: 0,
      tilesBody: 0,
      tile: 0,
      titleWidth: 0,
      titleHeight: 0,
      titleTileBody: 0,
      titleTile: 0,
    };
  });
  const [tilesValue, setTileValue] = useState((tilesValue) => {
    const newTilesValue = {};
    for (let i = 1; i <= 9; i++) {
      newTilesValue[`Stile${i}`] = {
        value: "",
        tiles: {},
      };
      for (let j = 1; j <= 9; j++) {
        newTilesValue[`Stile${i}`].tiles[`tile${j}`] = { value: "" };
      }
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
    let newGameHeight, newgameWidth;
    if (window.innerWidth < 371) {
      newgameWidth = window.innerWidth - 10;
    } else {
      newgameWidth = 372;
    }
    newGameHeight = ((newgameWidth - 12) / 3) * 4 + 15;
    if (window.innerHeight - 30 < newGameHeight) {
      newGameHeight = window.innerHeight - 40;
      newgameWidth = (newGameHeight / 4 - 15) * 3 + 12;
    }
    setdimensions({
      gameWidth: `${newgameWidth}px`,
      gameHeight: `${newGameHeight}px`,
      tilesBody: `${newgameWidth}px`,
      tile: (newgameWidth - 12) / 3,
      titleWidth: `${newgameWidth}px`,
      titleHeight: `${(newGameHeight - 15) / 4 + 3}px`,
      titleTileBody: `${(newGameHeight - 15) / 4 + 3}px`,
      titleTile: (newGameHeight - 15) / 4 / 3,
    });
  };

  if (dimensions.gameWidth === 0 && dimensions.gameHeight === 0)
    getCanvasDimensions();

  window.addEventListener("resize", getCanvasDimensions);

  useEffect(() => {
    if (curPlayer === "Player2" && mode === "COMPUTER") {
      const computerNextMove = ComputerMove(
        tilesValue,
        curSuperTile,
        players[curPlayer]
      );

      setTimeout(() => {
        HandleButtonClick(
          setTileValue,
          computerNextMove,
          curSuperTile,
          setCurSuperTile,
          players[curPlayer],
          setCurPlayer
        );
      }, 1000);
    }
  }, [curPlayer]);

  useEffect(() => {
    let unsubscribeFromNode = null;
    if (!roomKey || !uid) return;
    if (roomKey === "Single") setMode("COMPUTER");
    else {
      JoinGameRoom(
        uid,
        roomKey,
        tilesValue,
        "SuperTicTacToe",
        setPlayersJoined,
        setPlayer,
        setCurPlayer,
        setCurSuperTile,
        setTileValue
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
        const playerPath = `Games/SuperTicTacToe/${roomKey}/players/${uid}`;
        updateDataInNode(playerPath, { online: false });
      }
    };
  }, [uid, roomKey]);

  const HandlePVPUpdate = (
    opponentMove,
    newSuperTile,
    curSuperTile,
    playerTurn
  ) => {
    if (opponentMove === null || opponentMove === -1)
      setCurSuperTile(newSuperTile);
    else
      HandleButtonClick(
        setTileValue,
        opponentMove,
        curSuperTile,
        setCurSuperTile,
        players[playerTurn],
        setCurPlayer,
        setWinnerName,
        curPlayer,
        roomKey,
        uid
      );
  };

  useEffect(() => {
    curSuperTileRef.current = curSuperTile;
    tilesValueRef.current = tilesValue;
    curPlayerRef.current = curPlayer;
  }, [curSuperTile, tilesValue, curPlayer]);

  useEffect(() => {
    if (playersJoined) {
      if (!mode) {
        setMode("PVP");
        initGame(
          uid,
          roomKey,
          curPlayerRef,
          tilesValueRef,
          curSuperTileRef,
          HandlePVPUpdate
        );
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
      newTilesValue[`Stile${i}`] = {
        value: "",
        tiles: {},
      };
      for (let j = 1; j <= 9; j++) {
        newTilesValue[`Stile${i}`].tiles[`tile${j}`] = { value: "" };
      }
    }

    handlePlayerWinModalClose();
    if (mode === "PVP") {
      const playerPath = `Games/SuperTicTacToe/${roomKey}/players/${uid}`;
      const playerData = {
        online: true,
        tiles: newTilesValue,
        curPlayer: "Player1",
        curSuperTile: "",
      };
      await updateDataInNode(playerPath, playerData);
      handleWaitingModalOpen();
    }
    setTileValue(newTilesValue);
    setWinnerName(null);
    setPlayerWins(null);
    setCurPlayer("Player1");
    setCurSuperTile(null);
  };

  const setPlayerOffline = async () => {
    const playerPath = `Games/SuperTicTacToe/${roomKey}/players/${uid}`;
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
            <Card style={{ width: "min-content", height: "fit-content" }}>
              <Card.Body className="body">
                <div
                  className="gamebody"
                  style={{
                    width: dimensions.gameWidth,
                    height: dimensions.gameHeight,
                  }}
                >
                  <div
                    className="title"
                    style={{
                      width: dimensions.titleWidth,
                      height: dimensions.titleHeight,
                    }}
                  >
                    <div
                      className="titleTiles"
                      style={{
                        width: dimensions.titleTileBody,
                        height: dimensions.titleTileBody,
                      }}
                    >
                      {Object.values(tilesValue).map((tile, index) => (
                        <div
                          className="titleTile"
                          key={index}
                          style={{
                            backgroundColor:
                              curSuperTile - 1 === index ? "red" : "#eee",
                            width: dimensions.titleTile,
                            height: dimensions.titleTile,
                          }}
                          onClick={() =>
                            HandleHintClick(
                              setDisplayHint,
                              tilesValue,
                              curSuperTile,
                              setCurSuperTile,
                              index,
                              mode,
                              roomKey,
                              uid
                            )
                          }
                        >
                          {tile.value}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ display: "flex" }}>
                        <div>{"Turn: "}</div>
                        <div>
                          {curPlayer === "Player1"
                            ? "Player 1"
                            : mode === "COMPUTER"
                            ? "Computer"
                            : "Player 2"}
                        </div>
                      </div>
                      {!curSuperTile && <div>Select a Super Tile to Play</div>}
                    </div>
                  </div>
                  <div
                    className="tiles"
                    style={{
                      width: dimensions.tilesBody,
                      height: dimensions.tilesBody,
                    }}
                  >
                    {curSuperTile &&
                      Object.values(
                        tilesValue[`Stile${curSuperTile}`].tiles
                      ).map((tile, index) => (
                        <div
                          className="tile"
                          key={index}
                          style={{
                            width: `${dimensions.tile}px`,
                            height: `${dimensions.tile}px`,
                            fontSize: `${dimensions.tile}px`,
                          }}
                          onClick={() => {
                            if (
                              (mode === "COMPUTER" &&
                                curPlayer === "Player2") ||
                              (mode === "PVP" && curPlayer !== player)
                            )
                              return;
                            HandleButtonClick(
                              setTileValue,
                              index,
                              curSuperTile,
                              setCurSuperTile,
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
                  {displayHint && (
                    <HintTiles
                      dimensions={dimensions}
                      tilesValue={tilesValue}
                      setDisplayHint={setDisplayHint}
                    ></HintTiles>
                  )}
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

export default SuperTicTacToe;
