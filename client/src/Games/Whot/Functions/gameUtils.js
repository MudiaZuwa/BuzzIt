export const handleResize = (
  gameRef,
  canvasRef,
  gameBodyRef,
  setGameWidth,
  setGameHeight,
  isMobile
) => {
  let width = gameBodyRef.current.clientWidth;
  let height = gameBodyRef.current.clientHeight;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const cardWidth = (height - 40) / 5;
  if (width < cardWidth * 7 + 40 && !isMobile)
    height = ((width - 40) / 7) * 5 + 40;

  setGameWidth(width);
  setGameHeight(height);
  if (gameRef.current) {
    gameRef.current.gameDimensions = {
      width: width,
      height: height,
    };
  }
  if (canvasRef.current) {
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    if (isMobile) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.rotate(Math.PI / 2);
      if (gameRef.current) gameRef.current.isLandScape = true;
    } else {
      ctx.restore();
      if (gameRef.current) gameRef.current.isLandScape = false;
    }
  }
};
