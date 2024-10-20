import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.js";
import io from "socket.io-client";
import { createBet } from "../services/wagerService.js";  // Import createBet function

const BASE_SERVER_URL = process.env.REACT_APP_BASE_SERVER_URL;

const Home = () => {
  const { mongoUserId } = useUser();
  const [wagers, setWagers] = useState([]);
  const [filteredWagers, setFilteredWagers] = useState([]);  // Track filtered wagers
  const [showUserBets, setShowUserBets] = useState(false);  // Track if user wants to show wagers they've bet on
  const [showUserWagers, setShowUsersWagers] = useState(false);
  const [showBetableWagers, setShowBetableWagers] = useState(false);
  const [showBetInput, setShowBetInput] = useState(false);
  const [betInputs, setBetInputs] = useState({}); // Track bet inputs
  const [selectedBet, setSelectedBet] = useState({}); // Track selected bet (wagerId + agree/disagree)

  useEffect(() => {
    // Initialize socket connection
    const socket = io(BASE_SERVER_URL); // Adjust the URL as needed
  
    // Listen for updates from the server
    socket.on("wagersUpdate", (updatedWagers) => {
      setWagers(updatedWagers || []);

      // Initial filtering
      applyFilters(updatedWagers, showUserWagers, showUserBets, showBetableWagers);
    });
  
    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [mongoUserId, showUserWagers, showUserBets, showBetableWagers]);

  // Apply filters whenever a filter is toggled
  useEffect(() => {
    applyFilters(wagers, showUserWagers, showUserBets, showBetableWagers);
  }, [showUserWagers, showUserBets, showBetableWagers, wagers]);

  // Helper function to apply all active filters
  const applyFilters = (allWagers, showUserWagers, showUserBets, showBetableWagers) => {
    let filtered = allWagers;

    if (showUserWagers) {
      filtered = filterUserCreated(filtered);
    }

    if (showUserBets) {
      filtered = filterUserBets(filtered);
    }

    if (showBetableWagers) {
      filtered = filterUserBetable(filtered);
    }

    setFilteredWagers(filtered);
  };

  // Filter for wagers created by the user
  const filterUserCreated = (wagers) => {
    return wagers.filter((wager) => wager.creator === mongoUserId);
  };

  // Filter for wagers the user has already bet on
  const filterUserBets = (wagers) => {
    return wagers.filter((wager) => wager.bets.some((bet) => bet.user === mongoUserId));
  };

  // Filter for wagers the user has not bet on
  const filterUserBetable = (wagers) => {
    return wagers.filter((wager) => wager.bets.every((bet) => bet.user !== mongoUserId));
  };

  // Handle input change for each wager
  const handleBetInputChange = (wagerId, value) => {
    setBetInputs((prev) => ({ ...prev, [wagerId]: value }));
  };

  // Handle showing bet input
  const handleShowBetInput = (wagerId, agreeBet) => {
    setShowBetInput(true);
    setSelectedBet({ wagerId, agreeBet });
  };

  // Handle cancel bet
  const handleCancelBet = () => {
    setSelectedBet({});
    setShowBetInput(false);
  };

  // Handle submit bet
  const handleSubmitBet = async (wagerId, agreeBet) => {
    const credits = betInputs[wagerId];
    if (!credits || isNaN(credits)) {
      return alert("Please enter a valid number of credits.");
    }

    const betPayload = {
      user: mongoUserId,
      credits: parseInt(credits, 10),
      agreeBet: agreeBet,
      rlEventReference: wagerId,
      wagerId: wagerId
    };

    try {
      await createBet(betPayload);
      alert("Bet placed successfully!");
      setSelectedBet({});  // Clear the selected bet after submission
      setBetInputs({});  // Clear the input field after submission
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Welcome to the Wager Dashboard, {mongoUserId}</h2>

      <div style={styles.toggleContainer}>
        <label>
          <input
            type="checkbox"
            checked={showUserWagers}
            onChange={() => setShowUsersWagers((prev) => !prev)}
          />
          View Your Wagers
        </label>
        <label>
          <input
            type="checkbox"
            checked={showUserBets}
            onChange={() => setShowUserBets((prev) => !prev)}
          />
          Show Wagers You've Bet On
        </label>
        <label>
          <input
            type="checkbox"
            checked={showBetableWagers}
            onChange={() => setShowBetableWagers((prev) => !prev)}
          />
          Show Wagers You Haven't Bet On
        </label>
      </div>

      <div style={styles.wagerListContainer}>
        <ul style={styles.wagerList}>
          {filteredWagers.length === 0 ? (
            <p>No wagers available.</p>
          ) : (
            filteredWagers.map((wager) => (
              <li key={wager._id} style={styles.wagerItem}>
                <div style={styles.wagerHeader}>
                  <strong>Wager ID: {wager._id}</strong>
                  <strong><br/>{wager.name}</strong>
                  <p><br/>Creator: {wager.creator}</p>
                </div>
                {wager.bets.every((bet) => bet.user !== mongoUserId) && (
                  <div style={styles.wagerBody}>
                    <div style={styles.agreeSection}>
                      <div>
                        <strong>Agree:</strong> {wager.agreePercentage}%
                      </div>
                      {wager.creator !== mongoUserId && (
                        <button
                          style={styles.betButton}
                          onClick={() => handleShowBetInput(wager._id, true)}
                        >
                          Bet on Agree
                        </button>
                      )}
                    </div>

                    <div style={styles.disagreeSection}>
                      <div>
                        <strong>Disagree:</strong> {wager.disagreePercentage}%
                      </div>
                      {wager.creator !== mongoUserId && (
                        <button
                          style={styles.betButton}
                          onClick={() => handleShowBetInput(wager._id, false)}
                        >
                          Bet on Disagree
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Show input when Bet button is clicked */}
                {showBetInput && selectedBet.wagerId === wager._id && (
                  <div>
                    I bet{" "}
                    <input
                      type="number"
                      id="numberInput"
                      value={betInputs[wager._id] || ""}
                      onChange={(e) => handleBetInputChange(wager._id, e.target.value)}
                      min="0"
                      step="1"
                    />{" "}
                    credits that this <strong>{selectedBet.agreeBet ? "will" : "will not"}</strong> happen
                    <button
                      style={styles.submitBetButton}
                      onClick={() => handleSubmitBet(wager._id, selectedBet.agreeBet)}
                    >
                      Submit Bet
                    </button>
                    <button
                      style={styles.submitBetButton}
                      onClick={() => handleCancelBet()}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Home;

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
    backgroundColor: "#635d5d",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  },
  header: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  toggleContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
  },
  wagerListContainer: {
    textAlign: "left",
  },
  wagerList: {
    listStyle: "none",
    padding: 0,
  },
  wagerItem: {
    marginBottom: "15px",
    backgroundColor: "#4f4b4b",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
  },
  wagerHeader: {
    fontSize: "18px",
    marginBottom: "10px",
    textAlign: "center",
  },
  wagerBody: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  agreeSection: {
    width: "45%",
    textAlign: "center",
  },
  disagreeSection: {
    width: "45%",
    textAlign: "center",
  },
  input: {
    marginTop: "10px",
    marginBottom: "10px",
    padding: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "100%",
  },
  betButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
  submitBetButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
};
