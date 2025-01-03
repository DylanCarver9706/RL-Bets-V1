// app/controllers/plaidController.js
const { createLinkToken, completeIDVSession } = require("../services/plaidService");

const generateLinkToken = async (req, res) => {
  try {
    const { mongoUserId } = req.body;

    if (!mongoUserId) {
      return res.status(400).json({ error: "Missing MongoDB User ID" });
    }

    const linkToken = await createLinkToken(mongoUserId);
    res.status(200).json(linkToken);
  } catch (error) {
    console.error("Error creating Plaid Link token:", error.message);
    res.status(500).json({ error: "Failed to create Link token" });
  }
};

const completeIDV = async (req, res) => {
  try {
    const { idvSession } = req.body;

    if (!idvSession) {
      return res.status(400).json({ error: "Missing IDV session ID" });
    }

    const idvResult = await completeIDVSession(idvSession);

    let responseBody = {
      status: idvResult.status,
      idvSession,
    };

    if (idvResult.user?.date_of_birth) {
      responseBody.DOB = idvResult.user.date_of_birth;
    }

    res.status(200).json(responseBody);
  } catch (error) {
    console.error("Error completing IDV:", error.message);
    res.status(500).json({ error: "Failed to update IDV status" });
  }
};

module.exports = { generateLinkToken, completeIDV };
