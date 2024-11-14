import GameBody from "./GameBody";
import MouseListener from "./MouseListener";
import Cards from "./Cards";
import TouchListener from "./TouchListener";

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
    this.playerTurn = null;
  }

  Start(players, room, uid) {
    this.players = players;
    this.room = room;
    this.player = uid;
    this.Cards.roundTurns = this.players;
    this.Cards.setupListeners();
    this.started = true;
    this.Cards.Restart();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.gameDimensions, this.gameDimensions);
    this.GameBody.animate();
    if (this.Cards.stacks) this.Cards.animate();
  }
}
