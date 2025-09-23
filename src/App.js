import Home from "./Pages/Home.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "./Pages/Profile.js";
import PostDetails from "./Pages/PostDetails.js";
import Message from "./Pages/Message.js";
import Notifications from "./Pages/Notifications.js";
import ChessGame from "./Games/Chess.js";
import ImageSlidePuzzle from "./Games/Image Slide Puzzle.js";
import BrickBreak from "./Games/Brick Break.js";
import BallFall from "./Games/Ball Fall.js";
import SuperTicTacToe from "./Games/SuperTicTacToe.js";
import TicTacToe from "./Games/TicTacToe.js";
import Game from "./Pages/Game.js";
import Whot from "./Games/Whot.js";
import Search from "./Pages/Search.js";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/:userId" element={<ProfilePage />} />
        <Route path="/:userId/:postId" element={<PostDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/messages" element={<Message />} />
        <Route path="/messages/:userId" element={<Message />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/games" element={<Game />} />

        {/* Games */}
        <Route path="/Games/Chess/:roomKey" element={<ChessGame />} />
        <Route
          path="/Games/ImageSlidePuzzle/:roomKey"
          element={<ImageSlidePuzzle />}
        />
        <Route path="/Games/BrickBreak/:roomKey" element={<BrickBreak />} />
        <Route path="/Games/BallFall/:roomKey" element={<BallFall />} />
        <Route
          path="/Games/SuperTicTacToe/:roomKey"
          element={<SuperTicTacToe />}
        />
        <Route path="/Games/TicTacToe/:roomKey" element={<TicTacToe />} />
        <Route path="/Games/Whot/:roomKey" element={<Whot />} />
      </Routes>
    </Router>
  );
};

export default App;
