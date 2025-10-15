/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const {onCall, HttpsError} = require("firebase-functions/https");

const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
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

const getGreatHitCollectionPath = (gameType) => {
  return `${GREATEST_HITS_COLLECTION}/${gameType}/games`;
};

/**
 * Callable function to add or update a game in the top_ten_games collection.
 * It reads the game data from the "games" collection and manages the top 10
 * list.
 */
exports.updateTopTenGames = onCall(async (request) => {
  console.log("request:", request);

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

