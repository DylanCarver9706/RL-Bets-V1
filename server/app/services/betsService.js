const { collections } = require("../../database/mongoCollections");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");
const { ObjectId } = require("mongodb");
const { getSocketIo } = require("../middlewares/socketIO");
const { getAllWagers } = require("./wagersService");
const { getCurrentLeaderboard } = require("./leaderboardService");

const createBet = async (betData) => {
  const { user, credits, agreeBet, rlEventReference, wagerId } = betData;

  // Validate user and their credits
  const userDoc = await collections.usersCollection.findOne({
    _id: ObjectId.createFromHexString(user),
  });
  if (!userDoc) throw new Error("User not found");
  if (userDoc.credits < credits) throw new Error("Insufficient credits");

  const newBet = {
    user: ObjectId.createFromHexString(user),
    credits,
    agreeBet,
    rlEventReference: ObjectId.createFromHexString(rlEventReference),
    wagerId: ObjectId.createFromHexString(wagerId),
  };

  const result = await createMongoDocument(collections.betsCollection, newBet);

  const io = getSocketIo();

  // Update wager with the new bet
  const wager = await updateMongoDocument(collections.wagersCollection, wagerId, {
    $push: { bets: result.insertedId },
  }, true);

  const allWagers = await getAllWagers();
  io.emit("wagersUpdate", allWagers);

  // Deduct credits from user
  const updatedUser = await updateMongoDocument(
    collections.usersCollection,
    user,
    {
      $set: { credits: userDoc.credits - credits },
    },
    true
  );

  io.emit("updateUser", updatedUser);

  // Update leaderboard with the new user
  const currentLeaderboard = await getCurrentLeaderboard();
  const currentLeaderboardId = currentLeaderboard._id.toString();

  // Check if the user is already in the leaderboard
  const userExists = currentLeaderboard.users.some(
    (userId) => userId.toString() === user.toString()
  );

  if (!userExists) {
    await updateMongoDocument(
      collections.leaderboardsCollection,
      currentLeaderboardId,
      {
        $push: { users: ObjectId.createFromHexString(user) },
      }
    );
    io.emit("updateLeaderboard", await getCurrentLeaderboard());
  }

  // Add bet to the transactions collection
  await createMongoDocument(collections.transactionsCollection, {
    user: ObjectId.createFromHexString(user),
    credits: credits,
    type: "bet",
    wager: wager.name,
    wagerId: ObjectId.createFromHexString(wagerId),
  })

  return {
    betId: result.insertedId,
    updatedCredits: userDoc.credits - credits,
  };
};

const getAllBets = async () => {
  return await collections.betsCollection.find().toArray();
};

const getBetById = async (id) => {
  return await collections.betsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const updateBet = async (id, updateData) => {
  if (updateData.rlEventReference) {
    updateData.rlEventReference = ObjectId.createFromHexString(
      updateData.rlEventReference
    );
  }
  await updateMongoDocument(collections.betsCollection, id, {
    $set: updateData,
  });
};

const deleteBet = async (id) => {
  await collections.betsCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = { createBet, getAllBets, getBetById, updateBet, deleteBet };
