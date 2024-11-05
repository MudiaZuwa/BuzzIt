import React, { useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import HandleLogin from "../Functions/HandleLogin";
import GoogleSignIn from "./GoogleSignIn";

const LoginForm = ({ setSuccess }) => {
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  const inputRefs = {
    email: {
      ref: useRef(),
      error: null,
    },
    password: {
      ref: useRef(),
      error: passwordError,
      setError: setPasswordError,
    },
  };

  const handleGoogleSignIn = () => {
    GoogleSignIn(null, setSuccess);
  };

  const setStates = { setValidated, setError, setIsPending, setSuccess };

  return (
    <>
      <Form
        className="custom-form"
        onSubmit={(e) => HandleLogin({ e, inputRefs, setStates })}
      >
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            required
            placeholder="Email Address"
            ref={inputRefs.email.ref}
            disabled={isPending}
          />
          <Form.Control.Feedback type="invalid">
            Enter a Valid Email
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            name="password"
            type="password"
            required
            placeholder="Password"
            ref={inputRefs.password.ref}
            isInvalid={passwordError}
            disabled={isPending}
          />
          <Form.Control.Feedback type="invalid">
            {passwordError || "Enter a valid password"}
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          Login
        </Button>
      </Form>
      <div className="text-center mt-3">
        <p>or</p>
        <Button
          variant="outline-primary"
          className="w-100"
          onClick={handleGoogleSignIn}
        >
          <i className="bi bi-google me-2"></i> Sign in with Google
        </Button>
      </div>
    </>
  );
};

export default LoginForm;
