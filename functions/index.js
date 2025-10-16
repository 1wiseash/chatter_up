/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const {firestore} = require("firebase-admin");
const {onCall, HttpsError} = require("firebase-functions/https");
const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {initializeApp} = require("firebase-admin/app");
const {getStorage} = require("firebase-admin/storage");
const {dirname, join, basename} = require("path");
const sharp = require("sharp");
const {existsSync, mkdirSync, unlinkSync} = require("fs");
const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// Initialize the Firebase Admin SDK
initializeApp();
const db = firestore();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({maxInstances: 5}, (req, res) => {...})`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({maxInstances: 10}) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const GAMES_COLLECTION = "chatter_up_games";
const GREATEST_HITS_COLLECTION = "greatest_hits";
const USER_PROFILES_COLLECTION = "user_profiles";
const HALL_OF_FAME_COLLECTION = "hall_of_fame";

const getGreatHitCollectionPath = (gameType) => {
  return `${GREATEST_HITS_COLLECTION}/${gameType}/games`;
};

const getHallOfFameCollectionPath = (gameType) => {
  return `${HALL_OF_FAME_COLLECTION}/${gameType}/users`;
};

/**
 * Callable function to add or update a game in the top_ten_games collection.
 * It reads the game data from the "games" collection and manages the top 10
 * list.
 */
exports.updateTopTenGames = onCall(async (request) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the gameId from the client-side request.
  const gameId = request.data.gameId;
  if (!gameId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a gameId.",
    );
  }

  const gameRef = db.collection(GAMES_COLLECTION).doc(gameId);

  // Use a transaction to ensure atomic reads and writes.
  try {
    await db.runTransaction(async (transaction) => {
      // 1. Get the game data.
      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists) {
        throw new HttpsError("not-found",
            `Game with ID ${gameId} not found.`);
      }
      const gameData = gameDoc.data();

      // 2. Get the current top 10 games, ordered by score.
      const topTenQuery = db.collection(getGreatHitCollectionPath(
          gameData.type)).orderBy("score", "desc").limit(10);
      const topTenSnapshot = await transaction.get(topTenQuery);

      // 3. Determine if the new game should be in the top 10.
      const shouldAdd = topTenSnapshot.size < 10 || gameData.score >
            topTenSnapshot.docs[topTenSnapshot.size - 1].data().score;

      if (shouldAdd) {
        // If the list is full, remove the lowest-scoring game.
        if (topTenSnapshot.size >= 10) {
          const lastGameDoc = topTenSnapshot.docs[topTenSnapshot.size - 1];
          transaction.delete(db.collection(getGreatHitCollectionPath(
              gameData.type)).doc(lastGameDoc.id));
        }

        // Add or update the game in the top_ten_games collection.
        // The gameId can be used as the document ID for easy lookup.
        const topTenGameRef = db.collection(getGreatHitCollectionPath(
            gameData.type)).doc(gameId);
        transaction.set(topTenGameRef, gameData);
      }
    });

    return {success: true,
      message: `Top ten games updated with game ID ${gameId}`};
  } catch (error) {
    console.error(error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal",
        "An unexpected error occurred.", error.message);
  }
});

/**
 * Callable function to add or update a user to the hall_of_fame collection.
 * It reads the user's game stats from the "users" collection and manages the
 * hall_of_fame lists.
 */
exports.updateHallOfFame = onCall(async (request) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the gameId from the client-side request.
  const userId = request.data.userId;
  if (!userId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a userId.",
    );
  }

  const userProfileRef = db.collection(USER_PROFILES_COLLECTION).doc(userId);

  // Use a transaction to ensure atomic reads and writes.
  try {
    await db.runTransaction(async (transaction) => {
      // 1. Get the user data.
      const userProfileDoc = await transaction.get(userProfileRef);
      if (!userProfileDoc.exists) {
        throw new HttpsError("not-found",
            `User with ID ${userId} not found.`);
      }
      const userProfile = userProfileDoc.data();

      // 2. Get the current top 10 users for each type of game, ordered by rank.
      const hofBusinessQuery = db.collection(getHallOfFameCollectionPath(
          "business")).orderBy("rank.business", "desc").limit(10);
      const hofBusinessSnapshot = await transaction.get(hofBusinessQuery);

      const hofDatingQuery = db.collection(getHallOfFameCollectionPath(
          "dating")).orderBy("rank.dating", "desc").limit(10);
      const hofDatingSnapshot = await transaction.get(hofDatingQuery);

      const hofSocialQuery = db.collection(getHallOfFameCollectionPath(
          "social")).orderBy("rank.social", "desc").limit(10);
      const hofSocialSnapshot = await transaction.get(hofSocialQuery);

      // 3. Determine if the user should be in any of the top 10s.
      const shouldAddBusiness = hofBusinessSnapshot.size < 10 || userProfile.rank.business >
            hofBusinessSnapshot.docs[hofBusinessSnapshot.size - 1].data().rank.business;

      if (shouldAddBusiness) {
        // If the list is full, remove the lowest-scoring game.
        if (hofBusinessSnapshot.size >= 10) {
          const lastBusinessUserDoc = hofBusinessSnapshot.docs[hofBusinessSnapshot.size - 1];
          transaction.delete(db.collection(getHallOfFameCollectionPath(
              "business")).doc(lastBusinessUserDoc.id));
        }

        // Add or update the user in the appropriate hall_of_fame collection.
        // The user id can be used as the document ID for easy lookup.
        const topTenBusinessUserRef = db.collection(getHallOfFameCollectionPath(
            "business")).doc(userId);
        transaction.set(topTenBusinessUserRef, userProfile);
      }

      const shouldAddDating = hofDatingSnapshot.size < 10 || userProfile.rank.dating >
            hofDatingSnapshot.docs[hofDatingSnapshot.size - 1].data().rank.dating;

      if (shouldAddDating) {
        // If the list is full, remove the lowest-scoring game.
        if (hofDatingSnapshot.size >= 10) {
          const lastDatingUserDoc = hofDatingSnapshot.docs[hofDatingSnapshot.size - 1];
          transaction.delete(db.collection(getHallOfFameCollectionPath(
              "dating")).doc(lastDatingUserDoc.id));
        }

        // Add or update the user in the appropriate hall_of_fame collection.
        // The user id can be used as the document ID for easy lookup.
        const topTenDatingUserRef = db.collection(getHallOfFameCollectionPath(
            "dating")).doc(userId);
        transaction.set(topTenDatingUserRef, userProfile);
      }

      const shouldAddSocial = hofSocialSnapshot.size < 10 || userProfile.rank.social >
            hofSocialSnapshot.docs[hofSocialSnapshot.size - 1].data().rank.social;

      if (shouldAddSocial) {
        // If the list is full, remove the lowest-scoring game.
        if (hofSocialSnapshot.size >= 10) {
          const lastSocialUserDoc = hofSocialSnapshot.docs[hofSocialSnapshot.size - 1];
          transaction.delete(db.collection(getHallOfFameCollectionPath(
              "social")).doc(lastSocialUserDoc.id));
        }

        // Add or update the user in the appropriate hall_of_fame collection.
        // The user id can be used as the document ID for easy lookup.
        const topTenSocialUserRef = db.collection(getHallOfFameCollectionPath(
            "social")).doc(userId);
        transaction.set(topTenSocialUserRef, userProfile);
      }
    });

    return {success: true,
      message: `Hall of Fame updated with user ID ${userId}`};
  } catch (error) {
    console.error(error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal",
        "An unexpected error occurred.", error.message);
  }
});

exports.compressImage = onObjectFinalized(async (event) => {
  const fileBucket = event.data.bucket; // The Storage bucket with the file.
  const filePath = event.data.name; // File path in the bucket.
  const contentType = event.data.contentType; // File content type.
  // A number that increases by 1 on each change.
  const metageneration = event.data.metageneration;
  const fileSize = event.data.size; // File size in bytes.

  const storage = getStorage();
  const bucket = storage.bucket(fileBucket);

  const ONE_KILOBYTE = 1024;
  const COMPRESSION_THRESHOLD = 250 * ONE_KILOBYTE; // 250 KB

  // Exit if this is a deletion or a metageneration is not the first.
  if (metageneration > 1 || !contentType.startsWith("image/")) {
    return console.log("Not a new image or not an image file.");
  }

  // Check if the image needs to be compressed.
  if (fileSize < COMPRESSION_THRESHOLD) {
    return console.log("Image size is below 250kb. No compression needed.");
  }

  // Prevent an infinite loop: don't process compressed images.
  // Add a metadata property to the compressed image.
  const originalMetadata = event.data.metadata || {};
  if (originalMetadata.compressed) {
    return console.log("Image is already a compressed version. Exiting.");
  }

  const fileName = basename(filePath);
  const tempFilePath = join("/tmp", fileName);
  const tempDir = dirname(tempFilePath);

  // Create the temp directory if it doesn't exist.
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, {recursive: true});
  }

  const file = bucket.file(filePath);

  console.log(`Downloading image from path: ${filePath}`);
  await file.download({destination: tempFilePath});

  console.log(`Compressing image with Sharp...`);
  const compressedBuffer = await sharp(tempFilePath)
      .jpeg({quality: 80})
      .toBuffer();

  console.log(`Uploading compressed image back to storage...`);
  await file.save(compressedBuffer, {
    metadata: {
      contentType: contentType,
      metadata: {compressed: "true"}, // Add a custom metadata property
    },
  });

  // Clean up temporary files.
  unlinkSync(tempFilePath);

  console.log(`Image at ${filePath} was replaced with a compressed version.`);
});
