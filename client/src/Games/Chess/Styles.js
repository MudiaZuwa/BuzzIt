const styles = {
  body: {
    width: "100%",
    height: "100vh",
    backgroundColor: "#7c4c3e",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    fontFamily: "CustomFont, sans-serif",
    position: "relative",
  },
  menu: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  optionsBody: {
    display: "flex",
  },
  fullscreen: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 1000,
    color: "grey",
  },
  roomName: {
    fontSize: "2vmax",
    marginBottom: "0.5vmax",
    display: "block",
    fontStyle: "inherit",
  },
  options: {
    fontSize: "1.2vmax",
    fontFamily: "CustomFont, sans-serif",
  },
  displayText: {
    position: "absolute",
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
  },
  parent: {
    position: "relative",
    display: "inline-block",
  },
};

export default styles;
