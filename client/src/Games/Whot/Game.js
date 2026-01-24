import GameBody from "./GameBody.js";
import MouseListener from "./MouseListener.js";
import Cards from "./Cards.js";
import TouchListener from "./TouchListener.js";

export default class GameManager {
  constructor(ctx, gameCanvas, gameDimensions, isMobile) {
    this.ctx = ctx;
    this.canvas = gameCanvas;
    this.gameDimensions = gameDimensions;
    this.isLandScape = isMobile;
    this.win = null;
    this.players = [];
    this.GameBody = new GameBody(this);
    this.Cards = new Cards(this);
    this.touchListener = new TouchListener(this);
    this.mouseListener = new MouseListener(this);
    this.Cards.roundTurns = this.players;
    this.started = false;
    this.playerTurn = null;
  }

  Start(players, room, uid) {
    this.players = players;
    this.room = room;
    this.Cards.roundTurns = this.players;
    this.Cards.setupListeners();
    this.started = true;
    this.Cards.Restart();
    console.log(this.Cards);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.gameDimensions, this.gameDimensions);
    this.GameBody.animate();
    if (this.Cards.stacks) this.Cards.animate();
  }
}
