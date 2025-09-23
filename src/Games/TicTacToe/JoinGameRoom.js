import DeleteDateInNode from "../../Functions/DeleteDataInNode.js";
import updateDataInNode from "../../Functions/UpdateDataInNode.js";
import ListenDataFromNode from "../../Functions/ListenDataFromNode.js";
import FetchDataFromNode from "../../Functions/FetchDataFromNode.js";
import {
  database,
  ref,
  set,
  push,
  onDisconnect,
} from "../../Components/firebase.js";
import sendGameRequest from "../../Functions/SendGameRequest.js";

const JoinGameRoom = async (
  uid,
  roomKey,
  Tiles,
  game,
  setTilesValue,
  setPlayersJoined,
  setCurPlayer,
  setPlayer
) => {
  const room = await FetchDataFromNode(`Games/${game}/${roomKey}`);
  let players = [];
  let curPlayer = "Player1";

  if (room) players = Object.keys(room.players);
  if (players.includes(uid)) {
    if (room.players[uid].tiles) Tiles = room.players[uid].tiles;
    if (room.players[uid].curPlayer) curPlayer = room.players[uid].curPlayer;
    const playerData = { online: true, tiles: Tiles, curPlayer };

    const gamePath = `Games/${game}/${roomKey}/players/${uid}`;

    await updateDataInNode(gamePath, playerData);
    setPlayer(room.players[uid].player);
    if (room.players[uid].tiles) {
      setTilesValue(Tiles);
      setCurPlayer(curPlayer);
    }
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
