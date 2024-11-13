import updateDataInNode from "../../Functions/UpdateDataInNode";
import ListenDataFromNode from "../../Functions/ListenDataFromNode";
import FetchDataFromNode from "../../Functions/FetchDataFromNode";
import { database, ref, onDisconnect } from "../../Components/firebase";

const JoinGameRoom = async (
  uid,
  roomKey,
  Tiles,
  game,
  setPlayersJoined,
  setPlayer,
  setCurPlayer,
  setCurSuperTile,
  setTilesValue
) => {
  const room = await FetchDataFromNode(`Games/${game}/${roomKey}`);
  let players = [];
  let curPlayer = "Player1";
  let curSuperTile = "";

  if (room) players = Object.keys(room.players);

  if (players.includes(uid)) {
    const gamePath = `Games/${game}/${roomKey}/players/${uid}`;

    if (room.players[uid].tiles) Tiles = room.players[uid].tiles;
    if (room.players[uid].curPlayer) curPlayer = room.players[uid].curPlayer;
    if (room.players[uid].curSuperTile)
      curSuperTile = room.players[uid].curSuperTile;

    const playerData = {
      online: true,
      tiles: Tiles,
      curSuperTile,
      curPlayer,
    };

    await updateDataInNode(gamePath, playerData);
    setPlayer(room.players[uid].player);
    if (room.players[uid].tiles) setTilesValue(Tiles);
    if (room.players[uid].curPlayer) setCurPlayer(curPlayer);
    if (room.players[uid].curSuperTile) setCurSuperTile(curSuperTile);
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
