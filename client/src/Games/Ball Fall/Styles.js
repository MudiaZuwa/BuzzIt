// style.js

const styles = {
  gameBody: {
    position: "relative",
    height: "100vh",
  },
  gameScreen: {
    display: "block",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
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
  touchArea: {
    flexGrow: 1,
    height: "100%",
    zIndex: 10,
    marginTop: 60,
  },
  pauseImage: {
    width: 40,
    height: 40,
    margin: 8,
    zIndex: 8,
  },
  livesText: {
    marginRight: 10,
  },
  livesImage: {
    width: 40,
    height: 40,
    margin: 8,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 0,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 10,
  },
  scoreLabel: {
    marginLeft: 15,
    fontSize: "1.2rem",
    color: "black",
  },
  score: {
    fontSize: "1.2rem",
    color: "black",
  },
};

export default styles;
