const CheckWinCondition = (index, tiles, type, player) => {
  const winningConditions = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];

  // Filter conditions that include the clicked tile index
  const relevantConditions = winningConditions.filter((condition) =>
    condition.includes(index)
  );

  // Check if any winning condition is fully met by the current player
  return relevantConditions.some((condition) =>
    condition.every((tile) => tiles[`tile${tile}`].value === player)
  );
};

export default CheckWinCondition;
