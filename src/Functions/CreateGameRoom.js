import { database, ref, set, push } from "../Components/firebase.js";

const CreateGameRoom = async (game, playersIDs, uid) => {
  let players = {};
  players[uid] = {
    id: uid,
    player: "Player1",
    online: true,
  };
  playersIDs.forEach((id, index) => {
    if (id === uid) return;
    players[id] = {
      id: id,
      player: `Player${index + 2}`,
      online: false,
    };
  });

  const gameRef = push(ref(database, `Games/${game}/`));
  const roomKey = gameRef.key;

  await set(gameRef, {
    id: roomKey,
    players: players,
    timeStamp: Date.now(),
  });

  return roomKey;
};

export default CreateGameRoom;
