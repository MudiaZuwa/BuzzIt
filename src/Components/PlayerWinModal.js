import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PlayerWinModal = ({ show, onPlayAgain, winnerName, playerWins }) => {
  const navigate = useNavigate();

  return (
    <Modal
      show={show}
      onHide={() => {}}
      centered
      backdrop="static" 
      keyboard={false} 
    >
      <Modal.Header>
        <Modal.Title>{winnerName} Wins!</Modal.Title>
      </Modal.Header>
      {playerWins && (
        <Modal.Body className="text-center">
          <p>Congratulations! You have won the game!</p>
        </Modal.Body>
      )}
      <Modal.Footer>
        <Button variant="success" onClick={onPlayAgain}>
          Play Again
        </Button>
        <Button variant="primary" onClick={() => navigate("/Game")}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PlayerWinModal;
