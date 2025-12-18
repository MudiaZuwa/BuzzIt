import { database } from "../config/firebase";

const createGameRoom = async (game, playersIDs, uid) => {
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

  const gameRef = database.ref(`Games/${game}/`).push();
  const roomKey = gameRef.key;

  await gameRef.set({
    id: roomKey,
    players: players,
    timeStamp: Date.now(),
  });

  return roomKey;
};

export default createGameRoom;
