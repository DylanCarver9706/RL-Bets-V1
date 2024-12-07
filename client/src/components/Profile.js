import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserById,
  updateUser,
  deleteUser as deleteMongoUser,
} from "../services/userService.js";
import {
  deleteUser as firebaseDeleteUser,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth"; // Import sendPasswordResetEmail
import { auth } from "../firebaseConfig.js";
import {
  generateLinkTokenForIDV,
  openPlaidIDV,
} from "../services/plaidService.js";
import { useUser } from "../context/UserContext.js";

const Profile = () => {
  const [userData, setUserData] = useState(null); // State to hold the user data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // Fetch the user data on component mount
  useEffect(() => {
    if (user) {
      fetchUserDetails(user.mongoUserId);
    }
  }, [user]);

  // Fetch user details using the provided MongoDB User ID
  const fetchUserDetails = async (userId) => {
    try {
      const userDetails = await getUserById(userId);
      setUserData(userDetails);
      setName(userDetails.name);
      setEmail(userDetails.email);
    } catch (err) {
      console.error("Error fetching user data:", err.message);
    }
  };

  // Handle updating the user information
  const handleUpdate = async () => {
    try {
      const updatedUser = await updateUser(user.mongoUserId, {
        name,
        email,
      });
      setUserData(updatedUser);
      alert("User updated successfully");
    } catch (err) {
      console.error("Error updating user data:", err.message);
      alert("Failed to update user. Please try again.");
    }
  };

  // Handle deleting the user from Firebase and MongoDB
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        // Delete user from MongoDB
        await deleteMongoUser(user.mongoUserId);

        // Delete Firebase user if present
        if (auth.currentUser) {
          await firebaseDeleteUser(auth.currentUser);
        }

        alert("User deleted successfully.");
        navigate("/Auth"); // Redirect to Auth after account deletion
      } catch (err) {
        console.error("Error deleting user account:", err.message);
        alert("Error deleting user account. Please try again.");
      }
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase sign-out
      navigate("/Auth"); // Redirect to Auth after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!email) {
      alert("Email is required to reset the password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent successfully.");
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleIdentityVerification = async () => {
    console.log(user.mongoUserId);
    const linkTokenData = await generateLinkTokenForIDV(user.mongoUserId);

    if (!linkTokenData || !linkTokenData.link_token) {
      throw new Error("Failed to generate Plaid Link token.");
    }

    const idvResult = await openPlaidIDV(linkTokenData.link_token);

    if (idvResult?.status === "success") {
      await updateUser(user.mongoUserId, { idvStatus: "verified" });
      setUser((prevUser) => ({
        ...prevUser,
        idvStatus: "verified",
      }));
      navigate("/");
    } else {
      navigate("/Profile");
    }
  };

  const handleEmailVerification = async () => {
    if (!auth.currentUser) {
      alert("No user is currently logged in.");
      return;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      alert(
        "Verification email sent. Please check your inbox and verify your email."
      );
    } catch (error) {
      console.error("Error sending email verification:", error.message);
      alert("Failed to send verification email. Please try again.");
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      {user ? (
        <div>
          <h3>Mongo ID: {user.mongoUserId}</h3>
          <h3>Firebase ID: {user.firebaseUserId}</h3>
          {userData ? (
            <div>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p>Credits: {userData.credits}</p>
              <p>Earned Credits: {userData.earnedCredits}</p>
              <p>Identity Verification Status: {userData.idvStatus}</p>
              {userData.idvStatus !== "verified" && (
                <button
                  onClick={handleIdentityVerification}
                  style={{ marginLeft: "10px" }}
                >
                  Verify Identity
                </button>
              )}
              <p>Email Verification Status: {userData.emailVerificationStatus}</p>
              {userData.emailVerificationStatus !== "verified" && (
                <button
                  onClick={() => handleEmailVerification()}
                  style={{ marginLeft: "10px" }}
                >
                  Resend Verification Email
                </button>
              )}
              <br />
              <button onClick={handleUpdate}>Update User</button>
              <button onClick={handleDelete} style={{ marginLeft: "10px" }}>
                Delete User
              </button>
              <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
                Logout
              </button>
              <button
                onClick={handleResetPassword}
                style={{ marginLeft: "10px" }}
              >
                Reset Password
              </button>
            </div>
          ) : (
            <p>Loading user details...</p>
          )}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Profile;
