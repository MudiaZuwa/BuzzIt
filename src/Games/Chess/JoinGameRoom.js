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

  if (room) players = Object.keys(room.players);

  const playerData = {
    online: true,
    pieces:
      gameManagerRef.current.Pieces.playerPieces[room.players[uid].player],
  };

  if (players.includes(uid)) {
    const gamePath = `Games/${game}/${roomKey}/players/${uid}`;
    await updateDataInNode(gamePath, playerData);
    gameManagerRef.current.player = room.players[uid].player;
    gameManagerRef.current.gameControl.playerId = uid;
    gameManagerRef.current.gameControl.room = roomKey;
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
