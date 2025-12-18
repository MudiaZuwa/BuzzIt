import { GAMESTATE } from "./gameControls.js";

let timerId;

export let timer;

export function CountDown(CountDownTimer, GameManage) {
  timerId = setInterval(() => {
    CountDownTimer--;
    if (CountDownTimer > 0) {
      document.getElementById("displayText").innerText = CountDownTimer;
    }
    if (CountDownTimer === 0) {
      clearInterval(timerId);
      GameManage.gameControl.gamestate = GAMESTATE.RUNNING;
      document.getElementById("displayText").style.display = "none";
      document.getElementById("displayText").style.backgroundColor =
        "transparent";
    }
  }, 1000);
}
