const CheckWinCondition = (index, tiles, type, player) => {
  const tilesConditions = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];
  const newConditions = tilesConditions.filter((condition) =>
    condition.includes(index)
  );
  return newConditions.some((condition) =>
    condition.every((tile) => tiles[`${type}${tile}`].value === player)
  );
};

export default CheckWinCondition;
