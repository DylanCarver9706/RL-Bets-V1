import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig.js"; // Import Firebase auth

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign-up
  const [email, setEmail] = useState("testuser@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Test User"); // Add a name field for new users
  const navigate = useNavigate();

  // Function to create a new user in the MongoDB database
  const createUserInDatabase = async (user) => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create user in database.");
      }

      console.log("User created successfully in MongoDB");
    } catch (err) {
      console.error("Error creating user in MongoDB:", err.message);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let userCredential;
      if (isLogin) {
        // Firebase login
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        // Firebase sign up
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Create a new user in MongoDB database
        await createUserInDatabase(userCredential.user);
      }

      // Navigate to Home after successful login/signup
      navigate("/");
    } catch (error) {
      console.error("Error during authentication:", error.message);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin} // Required only during sign-up
            />
          </div>
        )}
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Switch to Sign Up" : "Switch to Login"}
      </button>
    </div>
  );
};

export default Auth;
