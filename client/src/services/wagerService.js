import { getFirebaseIdToken } from "./firebaseService.js";

const BASE_SERVER_URL = process.env.REACT_APP_BASE_SERVER_URL; // Define your backend server URL

export const fetchWagers = async () => {
  try {
    const response = await fetch(`${BASE_SERVER_URL}/api/wagers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch wagers");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching wagers:", err.message);
  }
};

// Create wager
export const createWager = async (body) => {
  try {
    const idToken = await getFirebaseIdToken();

    const response = await fetch(`${BASE_SERVER_URL}/api/wagers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // Include the token in the headers
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to create wager");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error creating wager:", err.message);
  }
};

// Create bet
export const createBet = async (body) => {
  try {
    const idToken = await getFirebaseIdToken();

    const response = await fetch(`${BASE_SERVER_URL}/api/bets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // Include the token in the headers
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to create bet");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error creating bet:", err.message);
  }
};

// Fetch the teams
export const fetchTeams = async () => {
  try {
    const response = await fetch(`${BASE_SERVER_URL}/api/teams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch teams`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching teams:", err.message);
    throw err;
  }
};

export const fetchBettableObjects = async () => {
  try {
    const response = await fetch(`${BASE_SERVER_URL}/api/data-trees/bettable`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data tree`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching data tree:", err.message);
    throw err;
  }
};

export const capitalize = (str) => {
  if (!str) return ""; // Handle empty or null strings
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}