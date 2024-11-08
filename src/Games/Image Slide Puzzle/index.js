import React, { useEffect, useRef, useState } from "react";
import GameManager from "./Game";
import Tiles from "./Tiles";
import { Container, Row, Col, Form, Card } from "react-bootstrap";
import UseVerifyUser from "../../CustomUseHooks/UseVerifyUser";
import HomeLeftSideBar from "../../Components/HomeLeftSideBar";
import MobileBottomNavbar from "../../Components/MobileBottomNavbar";
import HomeRightSideBar from "../../Components/HomeRightSideBar";

const ImageSlidePuzzle = () => {
  const { uid, loggedIn } = UseVerifyUser();
  const canvasRef = useRef(null);
  const [gameImage, setGameImage] = useState(null);
  const [gameWidth, setGameWidth] = useState(360);
  const [gameHeight, setGameHeight] = useState(0);
  const gameManagerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    gameManagerRef.current = new GameManager({
      ctx,
      canvas,
      gameImage,
      gameWidth,
      gameHeight,
    });

    const handleResize = () => {
      let newWidth = window.innerWidth < 371 ? window.innerWidth - 10 : 360;
      let newHeight = ((newWidth - 10) / 4) * 7 + 10;

      if (window.innerHeight - 30 < newHeight) {
        newHeight = window.innerHeight - 40;
        newWidth = (newHeight / 7) * 4 - 10;
      }

      // Only update if dimensions have actually changed
      if (newWidth !== gameWidth || newHeight !== gameHeight) {
        setGameWidth(newWidth);
        setGameHeight(newHeight);
      }

      if (canvas) {
        canvas.width = newWidth;
        canvas.height = newHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [gameWidth, gameHeight]);

  useEffect(() => {
    if (gameImage) {
      const img = new Image();
      img.src = gameImage;

      img.onload = () => {
        gameManagerRef.current.Tiles = new Tiles(gameManagerRef.current, img);
      };
    }
  }, [gameImage]);

  useEffect(() => {
    const animate = () => {
      if (canvasRef) gameManagerRef.current.animate();
      requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animate);
    };
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.includes("image")) {
      const imageURL = URL.createObjectURL(file);
      setGameImage(imageURL);
    }
  };

  return (
    <div>
      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          <HomeLeftSideBar loggedIn={loggedIn} uid={uid} />

          {/* Middle Content Area */}
          <Col
            md={7}
            className=" mx-auto px-0 px-md-3 vh-100 pb-5 pb-md-0"
            style={{ overflowY: "scroll" }}
          >
            <Container className="text-center">
              {!gameImage && (
                <Row className="justify-content-center mb-3">
                  <Col md={8}>
                    <Card>
                      <Card.Body>
                        <h2>Image Slide Puzzle</h2>
                        <Form>
                          <Form.Group controlId="imagePicker">
                            <Form.Label>Select an Image:</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </Form.Group>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
              <Row className="justify-content-center">
                <Col md={8}>
                  <canvas
                    ref={canvasRef}
                    style={{
                      border: "1px solid #ccc",
                      display: "block",
                      margin: "auto",
                    }}
                  />
                </Col>
              </Row>
            </Container>
          </Col>

          {/* Right Sidebar */}
          <HomeRightSideBar />
        </Row>
      </Container>
      <MobileBottomNavbar uid={uid} />
    </div>
  );
};

export default ImageSlidePuzzle;
