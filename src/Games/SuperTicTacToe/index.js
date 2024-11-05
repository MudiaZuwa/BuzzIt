import { useEffect, useRef, useState } from "react";
import HandleButtonClick from "./HandleButtonClick";
import HintTiles from "./HintTiles";
import HandleHintClick from "./HandleHintClick";
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
        setPlayer
      ).then((unsubscribe) => (unsubscribeFromNode = unsubscribe));
    }

    return () => {
      if (unsubscribeFromNode) {
        unsubscribeFromNode();
      }
      if (uid && roomKey) {
        const playerPath = `Games/SuperTicTacToe/${roomKey}/players/${uid}`;
        updateDataInNode(playerPath, { option: false });
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
        setCurPlayer
      );
  };

  useEffect(() => {
    curSuperTileRef.current = curSuperTile;
    tilesValueRef.current = tilesValue;
    curPlayerRef.current = curPlayer;
  }, [curSuperTile, tilesValue, curPlayer]);

  useEffect(() => {
    if (playersJoined) {
      setMode("PVP");
      initGame(
        roomKey,
        roomKey,
        curPlayerRef,
        tilesValueRef,
        curSuperTileRef,
        HandlePVPUpdate
      );
    }
  }, [playersJoined]);

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
            style={{
              overflowY: "scroll",
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              paddingBottom: "50px",
            }}
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
    </div>
  );
};

export default SuperTicTacToe;
