const BASE_URL = process.env.REACT_APP_BASE_SERVER_URL; // Define your backend server URL

// Function to create a new user in the MongoDB database
export const createUserInDatabase = async (name, email, password, firebaseUserId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        firebaseUserId: firebaseUserId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create user in database.");
    }

    console.log("MongoDB User ID: ", data.userId);
    return data.userId;
  } catch (err) {
    console.error("Error creating user in MongoDB:", err.message);
    throw err;
  }
};

// Function to get the MongoDB user ID by Firebase user ID
export const getMongoUserIdByFirebaseId = async (firebaseUserId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/firebase/${firebaseUserId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch MongoDB user ID.");
    }

    return data._id; // Return the MongoDB user ID
  } catch (err) {
    console.error("Error fetching MongoDB user ID:", err.message);
    throw err;
  }
};

// Get a user by their MongoDB ID
export const getUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch user's data.");
    }

    return data; // Return the user data
  } catch (err) {
    console.error("Error fetching users:", err.message);
    throw err;
  }
};

// Get a user by their MongoDB ID
export const getUserById = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user data.");
      }
  
      return data; // Return the user data
    } catch (err) {
      console.error("Error fetching user by ID:", err.message);
      throw err;
    }
  };
  
// Update a user by their MongoDB ID
  export const updateUser = async (userId, updatedData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to update user data.");
      }
  
      return data; // Return the updated user data
    } catch (err) {
      console.error("Error updating user:", err.message);
      throw err;
    }
  };
  
// Delete a user by their MongoDB ID
  export const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user.");
      }
  
      return true; // Return true if successful
    } catch (err) {
      console.error("Error deleting user:", err.message);
      throw err;
    }
  };

// Function to connect to the Stripe API to make a purchase
export const createCheckoutSession = async (purchaseItems, mongoUserId, creditsTotal) => {
  console.log(purchaseItems, mongoUserId, creditsTotal)
  try {
    const response = await fetch(`${BASE_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ purchaseItems, mongoUserId, creditsTotal }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Purchase Failed");
    }

    return data; // Return the session ID for Stripe checkout
  } catch (err) {
    console.error("Purchase Failed:", err.message);
    throw err;
  }
};

// Get all logs
export const getLogs = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch logs.");
    }

    return data; // Return the logs data
  } catch (err) {
    console.error("Error fetching logs:", err.message);
    throw err;
  }
};