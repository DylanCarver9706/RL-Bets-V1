// app/controllers/stripeController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createCheckoutSession, handleWebhookEvent } = require("../services/stripeService");

const createSession = async (req, res) => {
  try {
    const { purchaseItems, mongoUserId, creditsTotal } = req.body;

    if (!purchaseItems || !mongoUserId || !creditsTotal) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const session = await createCheckoutSession(purchaseItems, mongoUserId, creditsTotal);
    res.status(200).json(session);
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET
    );

    const io = req.app.get("io");
    await handleWebhookEvent(event, io);

    res.status(200).send();
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = {
  createSession,
  stripeWebhook,
};