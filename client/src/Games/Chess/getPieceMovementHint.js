let gameData;

// Function to get possible movement hints for the selected piece
const getPieceMovementHint = (data) => {
  const { GameBody, Pieces, playerTurn } = data;
  const gameTiles = GameBody.tiles;
  const piecesData = Pieces;
  gameData = data;

  // Clear previous highlights
  gameTiles.forEach((tile) => (tile.highlighted = false));

  const opponent = playerTurn === "Player1" ? "Player2" : "Player1";

  Object.keys(piecesData.playerPieces).forEach((player) => {
    piecesData.playerPieces[player].forEach((piece) => {
      const { row, column, piece: pieceType, selected } = piece;
      const possibleMoves = getPossibleMoves(
        row,
        column,
        pieceType,
        playerTurn,
        piecesData
      );

      if (selected) {
        handleSelectedPieceHighlighting(
          gameTiles,
          piecesData,
          playerTurn,
          possibleMoves
        );
      } else if (player === opponent) {
        handleOpponentCheckHighlight(
          gameTiles,
          piecesData,
          playerTurn,
          possibleMoves
        );
      }
    });
  });
};

// Get possible moves based on piece type
const getPossibleMoves = (row, column, pieceType, playerTurn, piecesData) => {
  switch (pieceType) {
    case "Rook":
      return getTilesInDirection(row, column, [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]);
    case "Bishop":
      return getTilesInDirection(row, column, [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]);
    case "Pawn":
      return getPawnMoves(row, column, playerTurn, piecesData);
    case "Knight":
      return getKnightMoves(row, column, playerTurn, piecesData);
    case "Queen":
      return getTilesInDirection(row, column, [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]);
    case "King":
      return getTilesInDirection(
        row,
        column,
        [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ],
        1
      );
    default:
      return [];
  }
};

// Handle highlighting for the selected piece
const handleSelectedPieceHighlighting = (
  gameTiles,
  piecesData,
  playerTurn,
  possibleMoves
) => {
  if (possibleMoves.length === 0) {
    piecesData.playerPieces[playerTurn].forEach(
      (piece) => (piece.selected = false)
    );
  }
  possibleMoves.forEach((move) => {
    const tileIndex = gameTiles.findIndex(
      (tile) => tile.row === move.row && tile.column === move.column
    );
    if (tileIndex !== -1) gameTiles[tileIndex].highlighted = true;
  });
};

// Handle highlighting when the opponent's pieces put the player's King in check
const handleOpponentCheckHighlight = (
  gameTiles,
  piecesData,
  playerTurn,
  possibleMoves
) => {
  possibleMoves.forEach((move) => {
    const playerPieces = piecesData.playerPieces[playerTurn];
    const isCheck = playerPieces.some(
      (piece) =>
        piece.row === move.row &&
        piece.column === move.column &&
        piece.piece === "King"
    );

    if (isCheck) {
      const tileIndex = gameTiles.findIndex(
        (tile) => tile.row === move.row && tile.column === move.column
      );
      if (tileIndex !== -1) {
        gameTiles[tileIndex].check = true;
        gameTiles[tileIndex].highlighted = false;
      }
    }
  });
};

// Function to get possible moves in a specific direction
const getTilesInDirection = (startRow, startCol, directions, step = 8) => {
  const tiles = [];
  const { Pieces, playerTurn } = gameData;
  const playerPieces = Pieces.playerPieces[playerTurn];
  const opponentPieces =
    Pieces.playerPieces[playerTurn === "Player1" ? "Player2" : "Player1"];

  directions.forEach((dir) => {
    let row = startRow;
    let col = startCol;
    let reachedOpponent = false;

    for (let currentStep = 0; currentStep < step; currentStep++) {
      row += dir[0];
      col += dir[1];

      if (!isValidPosition(row, col, playerPieces)) break;

      const targetPiece = getPieceOnTile(row, col, Pieces);

      if (targetPiece) {
        if (
          opponentPieces.includes(targetPiece) &&
          (targetPiece.piece !== "Pawn" || dir[0] !== 0)
        ) {
          tiles.push({ row, column: col });
          reachedOpponent = true;
          break;
        }
        break;
      }
      tiles.push({ row, column: col });
    }
  });

  return tiles;
};

// Helper functions
const getPieceOnTile = (row, col, piecesData) => {
  return (
    Object.values(piecesData.playerPieces)
      .flat()
      .find(
        (piece) => piece.row === row && piece.column === col && piece.visible
      ) || null
  );
};

const getPawnMoves = (row, column, playerTurn, piecesData) => {
  const dir = playerTurn === "Player1" ? -1 : 1;
  const step = piecesData.playerPieces[playerTurn].some(
    (piece) => piece.row === row && piece.column === column && piece.moved
  )
    ? 1
    : 2;
  const frontTiles = getTilesInDirection(row, column, [[dir, 0]], step);

  const diagonalMoves = [
    [dir, -1],
    [dir, 1],
  ]
    .filter((offset) =>
      isOpponentTile(
        row + offset[0],
        column + offset[1],
        piecesData,
        playerTurn
      )
    )
    .map((offset) => ({ row: row + offset[0], column: column + offset[1] }));

  return [...frontTiles, ...diagonalMoves];
};

const getKnightMoves = (row, column, playerTurn, piecesData) => {
  return [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ]
    .filter((offset) =>
      isValidPosition(
        row + offset[0],
        column + offset[1],
        piecesData.playerPieces[playerTurn]
      )
    )
    .map((offset) => ({ row: row + offset[0], column: column + offset[1] }));
};

const isOpponentTile = (row, col, piecesData, playerTurn) => {
  const opponentPieces =
    piecesData.playerPieces[playerTurn === "Player1" ? "Player2" : "Player1"];
  return opponentPieces.includes(getPieceOnTile(row, col, piecesData));
};

const isValidPosition = (row, col, playerPieces) => {
  return (
    row >= 0 &&
    row < 8 &&
    col >= 0 &&
    col < 8 &&
    !playerPieces.some(
      (piece) => piece.row === row && piece.column === col && piece.visible
    )
  );
};

export default getPieceMovementHint;
