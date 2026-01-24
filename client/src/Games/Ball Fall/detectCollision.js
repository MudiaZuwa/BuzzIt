export function detectCollision(ball, gameObject) {
  //check collision with paddle
  let bottomofBall = ball.position.y + ball.height + ball.speed.y;
  let topofBall = ball.position.y;
  let topofObject = gameObject.position.y;
  let leftofBall = ball.position.x - ball.speed.x;
  let rigthofball = ball.position.x + ball.width + ball.speed.x;
  let bottomofObject = gameObject.position.y + gameObject.height;
  let leftsideofObject = gameObject.position.x;
  let rightSideofObject = gameObject.position.x + gameObject.width;

  if (
    bottomofBall >= topofObject &&
    leftofBall >= leftsideofObject &&
    rigthofball <= rightSideofObject &&
    topofBall <= bottomofObject
  ) {
    return true;
  } else {
    return false;
  }
}
