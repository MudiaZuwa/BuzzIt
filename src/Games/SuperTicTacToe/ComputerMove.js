const ComputerMove = (board, nextLocation, player) => {
  const opponent = player === "O" ? "X" : "O";

  // Helper function to check if a move results in a win
  const isWinningMove = (tile, mark) => {
    const { tile1, tile2, tile3, tile4, tile5, tile6, tile7, tile8, tile9 } =
      tile.tiles;
    const winningCombinations = [
      [tile1.value, tile2.value, tile3.value],
      [tile4.value, tile5.value, tile6.value],
      [tile7.value, tile8.value, tile9.value],
      [tile1.value, tile4.value, tile7.value],
      [tile2.value, tile5.value, tile8.value],
      [tile3.value, tile6.value, tile9.value],
      [tile1.value, tile5.value, tile9.value],
      [tile3.value, tile5.value, tile7.value],
    ];
    return winningCombinations.some((combination) =>
      combination.every((val) => val === mark)
    );
  };

  // Find available moves in the given tile
  const findAvailableMoves = (tile) => {
    return Object.keys(tile.tiles).filter(
      (key) => tile.tiles[key].value === ""
    );
  };

  // Check if a supertile is full (i.e., has no available moves)
  const isTileFull = (tile) => {
    return findAvailableMoves(tile).length === 0;
  };

  const getTileIndex = (key) => {
    return parseInt(key.replace("tile", "")) - 1;
  };

  // Simulate a move, check win/block, and return tile index if found
  const simulateMove = (tile, mark) => {
    const availableMoves = findAvailableMoves(tile);
    for (const move of availableMoves) {
      tile.tiles[move].value = mark;
      if (isWinningMove(tile, mark)) {
        tile.tiles[move].value = ""; // Undo the move
        return getTileIndex(move);
      }
      tile.tiles[move].value = ""; // Undo the move
    }
    return null; // No winning/blocking move found
  };

  // If a specific next location is provided, play there, but check if the supertile is full
  const selectedTile = board[`Stile${nextLocation}`];
  if (
    nextLocation !== null &&
    nextLocation !== undefined &&
    !isTileFull(selectedTile)
  ) {
    // Check for a winning move for the player
    let winningMove = simulateMove(selectedTile, player);
    if (winningMove !== null) return winningMove;

    // Block opponent's winning move
    let blockingMove = simulateMove(selectedTile, opponent);
    if (blockingMove !== null) return blockingMove;

    // If no win/block, pick a random available move
    const availableMoves = findAvailableMoves(selectedTile);
    if (availableMoves.length > 0) {
      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return getTileIndex(randomMove);
    }
  } else {
    // If no specific next location, search for a suitable large tile
    for (let i = 1; i <= 9; i++) {
      const selectedTile = board[`Stile${i}`];

      // Check for a winning move for the player
      let winningMove = simulateMove(selectedTile, player);
      if (winningMove !== null) return winningMove;

      // Block opponent's winning move
      let blockingMove = simulateMove(selectedTile, opponent);
      if (blockingMove !== null) return blockingMove;
    }

    // No win/block found; play randomly in any available small board
    for (let i = 1; i <= 9; i++) {
      const selectedTile = board[`Stile${i}`];
      const availableMoves = findAvailableMoves(selectedTile);
      if (availableMoves.length > 0) {
        const randomMove =
          availableMoves[Math.floor(Math.random() * availableMoves.length)];
        return getTileIndex(randomMove);
      }
    }
  }

  return null; // No moves available
};

export default ComputerMove;
