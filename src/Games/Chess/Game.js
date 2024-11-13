import initApp from "./app";
import GameBody from "./GameBody";
import gameControl, { GAMESTATE } from "./gameControls";
import getPieceMovementHint from "./getPieceMovementHint";
import MouseListener from "./MouseListener";
import Pieces from "./Pieces";

export default class GameManager {
  constructor(ctx, gameCanvas, gameDimensions, setWinnerName) {
    this.ctx = ctx;
    this.canvas = gameCanvas;
    this.gameDimensions = gameDimensions;
    this.GameBody = new GameBody(this);
    this.Pieces = new Pieces(this, setWinnerName);
    // this.touchListener = new TouchListener(this);
    this.mouseListener = new MouseListener(this);
    this.gameControl = new gameControl(this);
    this.playerTurn = "Player1";
  }

  animate() {
    this.ctx.clearRect(0, 0, this.gameDimensions, this.gameDimensions);
    this.GameBody.animate();
    if (this.gameControl.gamestate !== GAMESTATE.RUNNING) return;
    this.Pieces.animate();
    if (this.GameBody) getPieceMovementHint(this);
  }
}
