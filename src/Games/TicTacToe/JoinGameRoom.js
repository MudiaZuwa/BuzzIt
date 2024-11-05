import DeleteDateInNode from "../../Functions/DeleteDataInNode";
import updateDataInNode from "../../Functions/UpdateDataInNode";
import ListenDataFromNode from "../../Functions/ListenDataFromNode";
import FetchDataFromNode from "../../Functions/FetchDataFromNode";
import {
  database,
  ref,
  set,
  push,
  onDisconnect,
} from "../../Components/firebase";
import sendGameRequest from "../../Functions/SendGameRequest";

const JoinGameRoom = async (
  uid,
  roomKey,
  Tiles,
  game,
  setPlayersJoined,
  setPlayer
) => {
  const room = await FetchDataFromNode(`Games/${game}/${roomKey}`);
  let players = [];

  if (room) players = Object.keys(room.players);

  const playerData = { online: true, tiles: Tiles };
  if (players.includes(uid)) {
    const gamePath = `Games/${game}/${roomKey}/players/${uid}`;

    await updateDataInNode(gamePath, playerData);
    setPlayer(room.players[uid].player);
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
