import Home from "./Pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "./Pages/Profile";
import PostDetails from "./Pages/PostDetails";
import Message from "./Pages/Message";
import Notifications from "./Pages/Notifications";
import ChessGame from "./Games/Chess";
import ImageSlidePuzzle from "./Games/Image Slide Puzzle";
import BrickBreak from "./Games/Brick Break";
import BallFall from "./Games/Ball Fall";
import SuperTicTacToe from "./Games/SuperTicTacToe";
import TicTacToe from "./Games/TicTacToe";
import Game from "./Pages/Game";
import Whot from "./Games/Whot";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/:userId" element={<ProfilePage />} />

        <Route path="/:userId/:postId" element={<PostDetails />} />
        <Route path="/messages" element={<Message />} />
        <Route path="/messages/:userId" element={<Message />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/Games" element={<Game />} />

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
