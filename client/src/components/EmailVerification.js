import React, { useEffect } from "react";
import { auth } from "../firebaseConfig";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../services/userService";

const EmailVerification = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailVerification = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        await currentUser.reload(); // Reload Firebase user data to get updated email verification status
        if (currentUser.emailVerified) {
          // Update the user's verification status in MongoDB
          await updateUser(user.mongoUserId, { emailVerificationStatus: "verified" });

          // Redirect the user to the homepage
          navigate("/");
          
          // Update the global user state
          setUser({ ...user, emailVerificationStatus: "verified" });
        }
      }
    };

    // Poll every 1.5 seconds to check if the email is verified
    const interval = setInterval(checkEmailVerification, 1500);

    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [user, setUser, navigate]);

  const resendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.sendEmailVerification();
        alert("Verification email has been resent. Please check your inbox.");
      } else {
        alert("Unable to resend email verification. Please log in again.");
      }
    } catch (error) {
      console.error("Error resending verification email:", error.message);
      alert("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Email Verification Required</h1>
      <p>
        Thank you for signing up! To proceed, please verify your email address.
        Check your inbox for a verification email and click the verification link.
      </p>
      <p>If you didn't receive the email, click the button below to resend it.</p>
      <button
        onClick={resendVerificationEmail}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Resend Verification Email
      </button>
    </div>
  );
};

export default EmailVerification;
