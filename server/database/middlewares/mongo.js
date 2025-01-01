const { getTimestamp } = require("../../app/utils/utils") 

const createMongoDocument = async (
  collection,
  data,
  returnDocument = false
) => {
  try {
    const documentData = {
      ...data,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    };

    // // Generate a temporary ObjectId to calculate aliasId before insertion
    // const tempObjectId = ObjectId.createFromHexString();
    // documentData._id = tempObjectId; // Manually assign the _id to the document
    // documentData.aliasId = generateAliasId(tempObjectId); // Generate the aliasId

    const result = await collection.insertOne(documentData);

    if (returnDocument && result.acknowledged && result.insertedId) {
      // Return the inserted document with the _id field to avoid and extra query
      return {
        _id: result.insertedId,
        ...documentData,
      };
    }

    return result;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

const updateMongoDocument = async (
  collection,
  documentId,
  updateMongoDataObject,
  returnUpdatedDocument = false
) => {
  try {
    // Merge all `$set` fields, including the updatedAt timestamp
    const mergedSet = {
      ...(updateMongoDataObject.$set || {}),
      updatedAt: getTimestamp(), // Add the updatedAt field
    };

    // Construct the update object
    const updateMongoDataObjectWithTimestamp = {
      ...updateMongoDataObject, // Include other operators like `$push`, `$inc`
      $set: mergedSet, // Merge the `$set` fields into one
    };

    // Perform the update operation
    const result = await collection.updateOne(
      { _id: ObjectId.createFromHexString(documentId) }, // Ensure `_id` is handled correctly
      updateMongoDataObjectWithTimestamp // Pass the constructed update object
    );

    if (
      returnUpdatedDocument &&
      result.acknowledged &&
      result.matchedCount > 0
    ) {
      // Fetch and return the updated document
      const updatedDocument = await collection.findOne({
        _id: ObjectId.createFromHexString(documentId),
      });
      // console.log("Updated Document:", updatedDocument);
      return updatedDocument;
    }

    return result; // Return the raw result of the update operation
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

module.exports = { createMongoDocument, updateMongoDocument };