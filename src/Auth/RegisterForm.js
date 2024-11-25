import React, { useState, useRef } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import HandleRegister from "../Functions/HandleRegister";
import GoogleSignIn from "./GoogleSignIn";
import { getDatabase, ref, set } from "../Components/firebase";

const RegisterForm = ({ setSuccess }) => {
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
    rePassword: {
      ref: useRef(),
      error: null,
    },
  };

  const setStates = { setValidated, setError, setIsPending, setSuccess };

  const handleGoogleSignIn = () => {
    GoogleSignIn(createNewProfile, setSuccess);
  };

  const createNewProfile = (email, UID) => {
    const AccountDetails = {
      email: email,
      id: UID,
      date: Date.now(),
    };

    const db = getDatabase();
    set(ref(db, `UsersDetails/${UID}`), AccountDetails)
      .then(() => {
        const AccountDetails = {
          email: email,
        };
        
        setSuccess(true);
        setIsPending(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
        } else {
          const errorCode = error.code;
          const errorMessage = error.message;
          setError(errorMessage);
          setIsPending(false);
        }
      });
  };

  return (
    <>
      <Form
        className="custom-form"
        onSubmit={(e) =>
          HandleRegister({ e, inputRefs, setStates, createNewProfile })
        }
      >
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group controlId="signupEmail" className="mb-3">
          <Form.Label>Email address</Form.Label>
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

        <Form.Group controlId="signupPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Create a password"
            required
            ref={inputRefs.password.ref}
            isInvalid={passwordError}
            disabled={isPending}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            required
            placeholder="Re-Enter Password"
            ref={inputRefs.rePassword.ref}
            isInvalid={passwordError}
            disabled={isPending}
          />
          <Form.Control.Feedback type="invalid">
            {passwordError || "Re-enter password to confirm"}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="success" type="submit" className="w-100 mb-2">
          Sign Up
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

export default RegisterForm;
