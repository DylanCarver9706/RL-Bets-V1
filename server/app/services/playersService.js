const { collections } = require("../../database/mongoCollections");
const {
    createMongoDocument,
    updateMongoDocument,
  } = require("../../database/middlewares/mongo");
const { ObjectId } = require("mongodb");

const createPlayer = async (playerData) => {
  if (!playerData.name || !playerData.team) {
    throw new Error("Player name and team ID are required.");
  }
  const result = await createMongoDocument(collections.playersCollection, playerData);
  await updateMongoDocument(collections.teamsCollection, playerData.team, {
    $push: { players: result.insertedId },
  });
  return { playerId: result.insertedId };
};

const getAllPlayers = async () => {
  return await collections.playersCollection.find().toArray();
};

const getPlayerById = async (id) => {
  return await collections.playersCollection.findOne({ _id: new ObjectId(id) });
};

const updatePlayer = async (id, updateData) => {
  await updateMongoDocument(collections.playersCollection, id, { $set: updateData });
};

const deletePlayer = async (id) => {
  const playerId = new ObjectId(id);

  const player = await getPlayerById(id);
  if (!player) throw new Error("Player not found");

  await updateMongoDocument(collections.teamsCollection, player.team, {
    $pull: { players: playerId },
  });
  await collections.playersCollection.deleteOne({ _id: playerId });
};

module.exports = {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
};