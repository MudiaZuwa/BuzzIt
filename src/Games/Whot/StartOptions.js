import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";

const StartOptions = ({ gameRef }) => {
  const [isWinner, setIWinner] = useState(false);

  const renderWinAndCardsInfo = () => {
    if (!gameRef.current) return null;
    if (isWinner) {
      return (
        <div>
          <h3>{gameRef.current.win} wins!</h3>
          {gameRef.current.Cards.roundTurns.length > 2 && (
            <p>Remaining cards: {gameRef.current.Cards.remainingCardsCount}</p>
          )}
          <Button
            onClick={() => {
              gameRef.current.Cards.Restart();
            }}
          >
            {gameRef.current.Cards.roundTurns.length > 2
              ? "Next Round"
              : "New Game"}
          </Button>
        </div>
      );
    } else {
      gameRef.current.Cards.setIWinner = setIWinner;
    }
    return null;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}
    >
      {renderWinAndCardsInfo()}

      {/* {!isFullScreen && isMobile && (
        <Button
          onClick={() =>
            setupFullScreenAndRotate(
              gameBodyRef,
              setIsFullScreen,
              setIsLandscape
            )
          }
          style={{
            marginTop: "20px",
          }}
        >
          Enable Fullscreen & Rotate
        </Button>
      )} */}
    </div>
  );
};

export default StartOptions;
