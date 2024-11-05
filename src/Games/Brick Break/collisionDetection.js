export function detectCollision(ball, gameObject){
     //check collision with paddle
     let bottomofBall= ball.position.y+ball.size;
     let topofBall=ball.position.y
     let topofObject= gameObject.position.y;
     let bottomofObject= gameObject.position.y+ gameObject.height;
     let leftsideofObject= gameObject.position.x;
     let rightSideofObject=gameObject.position.x+gameObject.width;

     if(bottomofBall>=topofObject && topofBall<=bottomofObject && ball.position.x>= leftsideofObject && ball.position.x+ball.size<=rightSideofObject){
       return true
     }else{
         return false
     }
}