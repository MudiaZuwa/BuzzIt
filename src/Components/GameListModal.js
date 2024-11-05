import React from "react";
import { Modal, Card } from "react-bootstrap";
import { gameData } from "../Games/GameData";
import CreateGameRoom from "../Functions/CreateGameRoom";
import sendGameRequest from "../Functions/SendGameRequest";

const GameListModal = ({ show, handleClose, uid, friendId }) => {
  const GameSelected = async (Game) => {
    const room = await CreateGameRoom(Game.name, [friendId], uid);

    await sendGameRequest(uid, friendId, Game.name, room);

    window.location.href = `/Games/${Game.path}/${room}`;
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="d-flex justify-content-between">
        <Modal.Title>Select Game</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {gameData.MultiPlayer.map((game) => (
          <div
            key={game.name}
            onClick={() => GameSelected(game)}
            className="game-card w-100 mb-3"
            style={{ cursor: "pointer" }}
          >
            <Card className=" bg-light w-100">
              {/* <Card.Img
                          src={game.imgSrc}
                          alt={game.name}
                          style={{ width: "100%" }}
                        /> */}
              <Card.Body>
                <Card.Title>{game.name}</Card.Title>
              </Card.Body>
            </Card>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
};

export default GameListModal;
