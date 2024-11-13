import updateDataInNode from "../../Functions/UpdateDataInNode";
import ListenDataFromNode from "../../Functions/ListenDataFromNode";
import FetchDataFromNode from "../../Functions/FetchDataFromNode";
import { database, ref, onDisconnect } from "../../Components/firebase";

const JoinGameRoom = async (
  uid,
  roomKey,
  gameManagerRef,
  game,
  setPlayersJoined
) => {
  const room = await FetchDataFromNode(`Games/${game}/${roomKey}`);
  let players = [];
  let playerTurn = "Player1";
  let playerPieces =
    gameManagerRef.current.Pieces.playerPieces[room.players[uid].player];

  if (room) players = Object.keys(room.players);

  if (players.includes(uid)) {
    if (room.players[uid].pieces) playerPieces = room.players[uid].pieces;
    if (room.players[uid].playerTurn) playerTurn = room.players[uid].playerTurn;

    const playerData = {
      online: true,
      pieces: playerPieces,
      playerTurn,
    };
    const gamePath = `Games/${game}/${roomKey}/players/${uid}`;
    await updateDataInNode(gamePath, playerData);

    gameManagerRef.current.player = room.players[uid].player;
    gameManagerRef.current.gameControl.playerId = uid;
    gameManagerRef.current.gameControl.room = roomKey;

    if (room.players[uid].pieces)
      gameManagerRef.current.Pieces.playerPieces[room.players[uid].player] =
        playerPieces;
    if (room.players[uid].playerTurn)
      gameManagerRef.current.Pieces.playerTurn = playerTurn;
  }

  const playerRef = ref(database, `Games/${game}/${roomKey}/players/${uid}`);
  onDisconnect(playerRef).update({ online: false });

  const unsubscribe = await ListenDataFromNode(
    `Games/${game}/${roomKey}/players`,
    (players) => {
      setPlayersJoined(Object.values(players).every((player) => player.online));
    }
  );

  return unsubscribe;
};

export default JoinGameRoom;
