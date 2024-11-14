import DeleteDateInNode from "../../../Functions/DeleteDataInNode";
import updateDataInNode from "../../../Functions/UpdateDataInNode";
import ListenDataFromNode from "../../../Functions/ListenDataFromNode";
import FetchDataFromNode from "../../../Functions/FetchDataFromNode";
import { database, ref, onDisconnect } from "../../../Components/firebase";

const JoinGameRoom = async (
  uid,
  roomKey,
  game,
  setPlayers,
  setPlayersJoined,
  gameRef
) => {
  const room = await FetchDataFromNode(`Games/${game}/${roomKey}`);
  let players = [];

  if (room) players = Object.keys(room.players);

  const playerData = {
    online: true,
  };

  if (players.includes(uid)) {
    const gamePath = `Games/${game}/${roomKey}/players/${uid}`;
    await updateDataInNode(gamePath, playerData);

    if (room.data?.playerTurn)
      gameRef.current.playerTurn = room.data.playerTurn;
    else gameRef.current.playerTurn = "Player1";
    gameRef.current.player = room.players[uid].player;
  }

  const playerRef = ref(database, `Games/${game}/${roomKey}/players/${uid}`);
  onDisconnect(playerRef).update({ online: false });

  const unsubscribe = await ListenDataFromNode(
    `Games/${game}/${roomKey}/players`,
    (players) => {
      setPlayers(() => {
        const onlinePlayers = Object.values(players).filter(
          (player) => player.online
        );
        const playersName = [];
        onlinePlayers.forEach((player) => playersName.push(player.player));
        return playersName;
      });
      setPlayersJoined(Object.values(players).every((player) => player.online));
    }
  );

  return unsubscribe;
};

export default JoinGameRoom;
