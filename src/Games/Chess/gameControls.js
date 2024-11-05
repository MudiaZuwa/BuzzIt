import { CountDown } from "./utils"; // Assuming it's an external utility
import initGame from "./app";

export const GAMESTATE = {
  RUNNING: 0,
  GAMEOVER: 1,
  STARTED: 2,
  MENU: 3,
};

export default class GameControl {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.gamestate = GAMESTATE.MENU;
    this.gameMode = null;
    this.room = "";
    this.displayText = "";
  }

  restart() {
    if (![GAMESTATE.GAMEOVER, GAMESTATE.MENU].includes(this.gamestate)) return;

    let countdown = 3;
    document.getElementById("displayText").innerText = countdown;
    CountDown(countdown, this.gameManager);
    this.gameManager.Pieces.Restart();

    this.gameManager.playerTurn = "Player1";
    this.gamestate = GAMESTATE.STARTED;
    initGame(this.gameManager, this.playerId);
  }
}
