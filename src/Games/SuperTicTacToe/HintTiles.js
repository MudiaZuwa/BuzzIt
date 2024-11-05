const HintTiles = ({ dimensions, tilesValue, setDisplayHint }) => {
  return (
    <div className="floatingBody">
      <div
        className="hintBody"
        style={{ width: dimensions.tilesBody, height: dimensions.tilesBody }}
      >
        <div className="floatingClose" onClick={() => setDisplayHint(false)}>
          &#10006;
        </div>
        {Object.values(tilesValue).map((Stile, index) => (
          <div
            className="STile"
            key={index}
            style={{
              width: `${dimensions.tile}px`,
              height: `${dimensions.tile}px`,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
            }}
          >
            {Object.values(Stile.tiles).map((tile, idx) => (
              <div
                className="hintTile"
                key={idx}
                style={{
                  width: `${dimensions.titleTile - 1}px`,
                  height: `${dimensions.titleTile - 1}px`,
                }}
              >
                {tile.value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HintTiles;
