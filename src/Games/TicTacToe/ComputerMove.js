const ComputerMove = (board, player) => {
  const opponent = player === "O" ? "X" : "O";

  // Helper function to check if a move results in a win
  const isWinningMove = (tiles, mark) => {
    const winningCombinations = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7],
    ];

    return winningCombinations.some((combination) =>
      combination.every((index) => tiles[`tile${index}`].value === mark)
    );
  };

  // Find available moves on the board
  const findAvailableMoves = (tiles) => {
    return Object.keys(tiles).filter((key) => tiles[key].value === "");
  };

  // Simulate a move, check for win/block, and return the move index if valid
  const simulateMove = (tiles, mark) => {
    const availableMoves = findAvailableMoves(tiles);
    for (const move of availableMoves) {
      tiles[move].value = mark; // Simulate the move
      if (isWinningMove(tiles, mark)) {
        tiles[move].value = ""; // Undo the move
        return parseInt(move.replace("tile", "")) - 1; // Return the index of the winning move
      }
      tiles[move].value = ""; // Undo the move
    }
    return null;
  };

  // Check for a winning move for the player
  let winningMove = simulateMove(board, player);
  if (winningMove !== null) return winningMove;

  // Block opponent's winning move
  let blockingMove = simulateMove(board, opponent);
  if (blockingMove !== null) return blockingMove;

  // If no win/block found, pick a random available move
  const availableMoves = findAvailableMoves(board);
  if (availableMoves.length > 0) {
    const randomMove =
      availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return parseInt(randomMove.replace("tile", "")) - 1; // Return the random move index
  }

  return null; // No moves available
};

export default ComputerMove;
