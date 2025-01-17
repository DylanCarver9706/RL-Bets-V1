// app/services/stripeService.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const { updateMongoDocument, createMongoDocument } = require("../../database/middlewares/mongo");
const { getSocketIo } = require("../middlewares/socketIO");

const createCheckoutSession = async (
  purchaseItems,
  mongoUserId,
  creditsTotal
) => {
  const lineItems = purchaseItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.DEV_CLIENT_URL}/Wagers`,
      cancel_url: `${process.env.DEV_CLIENT_URL}/Credit-Shop`,
      metadata: { mongoUserId, creditsTotal },
    });
    return session;
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error.message, error.stack);
    throw error;
  }
};

const handleWebhookEvent = async (event, io) => {
  const session = event.data.object;

  // Handle only 'checkout.session.completed' events
  if (event.type === "checkout.session.completed") {
    const userId = session.metadata.mongoUserId;
    const creditsPurchased = session.metadata.creditsTotal;

    try {
      const user = await collections.usersCollection.findOne({
        _id: ObjectId.createFromHexString(userId),
      });

      if (!user) {
        console.warn("User not found in database for ID:", userId);
        return;
      }

      const updatedCredits = (user.credits || 0) + parseFloat(creditsPurchased);

      const updatedUser = await updateMongoDocument(
        collections.usersCollection,
        userId,
        { $set: { credits: updatedCredits } },
        true
      );

      io = getSocketIo();
      io.emit("updateUser", updatedUser);

      // Add credit purchase to the transactions collection
      await createMongoDocument(collections.transactionsCollection, {
        user: user._id,
        credits: parseInt(creditsPurchased),
        type: "purchase",
      })

    } catch (error) {
      console.error("Error handling 'checkout.session.completed' event:", error.message, error.stack);
      throw error;
    }
  } else {
    console.warn("Unhandled Stripe event type:", event.type);
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhookEvent,
};
