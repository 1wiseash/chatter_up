/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const {firestore} = require("firebase-admin");
const {onCall, HttpsError, onRequest} = require("firebase-functions/https");
const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {initializeApp} = require("firebase-admin/app");
const {getStorage} = require("firebase-admin/storage");
const {dirname, join, basename} = require("path");
const sharp = require("sharp");
const {existsSync, mkdirSync, unlinkSync} = require("fs");
const {setGlobalOptions} = require("firebase-functions");
const {SecretManagerServiceClient} = require("@google-cloud/secret-manager");
const stripeLib = require("stripe");
const {OpenAI} = require("openai");


const firebaseConfig = {
  apiKey: "AIzaSyCGuKQb5nKUWmhKOtjc1yKjP4lNbEsCO4k",
  authDomain: "chatter-up-70a2f.firebaseapp.com",
  projectId: "chatter-up-70a2f",
  storageBucket: "chatter-up-70a2f.firebasestorage.app",
  messagingSenderId: "212324288165",
  appId: "1:212324288165:web:6c00a077ffc28125242f4c",
  measurementId: "G-V36RHPPESD",
};

const stripeInfo = {
  STRIPE_PUBLISHABLE_KEY: "pk_live_NKcZnKGuuFH8Q8AU9C5cPYJB",
  STRIPE_SECRET_KEY_NAME: "stripe_secret_key",
  STRIPE_TEST_PUBLISHABLE_KEY: "pk_test_FwGIQeNsaDdByaIg3Jfnvb3b",
  STRIPE_TEST_SECRET_KEY_NAME: "stripe_test_secret_key",
  PAID_PRICE_ID: "prod_TJTe5cIedbYpaY",
  PREMIUM_PRICE_ID: "prod_TJTqqJb41z0qUu",
  WHS_NAME: "stripe_webhook_secret",
};

const openAiConfig = {
  secretName: "openai_api_key",
  projectId: "212324288165",
  prompts: {
    business: {
      "id": "pmpt_68f16b2fb3948193a7be772331c832a9059f9228eb27216c",
      "version": "3",
      "variables": {
        "scenario": "example scenario",
      },
    },
    dating: {
      "id": "pmpt_68f16f185cb48196bfec8da82f62245e0a8fa33e2447d124",
      "version": "2",
      "variables": {
        "scenario": "example scenario",
      },
    },
    social: {
      "id": "pmpt_68f171f323c48196ae8658fd5295906f0f98ff411680f0ea",
      "version": "3",
      "variables": {
        "scenario": "example scenario",
      },
    },
  },
};

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
const USERS_COLLECTION = "users";
const HALL_OF_FAME_COLLECTION = "hall_of_fame";
const INVOICES_COLLECTION = "invoices";

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

/**
 * Fetch the secret value from Google Cloud Secret Manager
 * @param {string} projectId: GCP project ID
 * @param {string} secretName: name of the secret in Secret Manager
 * @return {Promise<string>} secret payload
 */
async function getSecret(projectId, secretName) {
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  const client = new SecretManagerServiceClient();

  try {
    const [version] = await client.accessSecretVersion({name});
    const payload = version.payload.data.toString();

    if (!payload) {
      throw new Error("Secret payload is empty or undefined.");
    }

    return Promise.resolve(payload);
  } catch (error) {
    console.error("Error accessing secret:", error);
    throw error;
  }
}

/**
 * Callable function to get a Google Cloud Secret
 */
exports.getSecret = onCall(async (request) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the projectId from the client-side request.
  const projectId = request.data.projectId;
  if (!projectId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a projectId.",
    );
  }

  // Get the secretName from the client-side request.
  const secretName = request.data.secretName;
  if (!secretName) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a secretName.",
    );
  }

  try {
    const secret = await getSecret(projectId, secretName);
    return {secret};
  } catch (error) {
    console.error("Error getting secret:", error);
    throw error;
  }
});

/**
 * Callable function to start a new OpenAI conversation
 */
exports.startConversation = onCall(async (request) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  try {
    const openAiApiKey = await getSecret(firebaseConfig.messagingSenderId, openAiConfig.secretName);
    const openai = new OpenAI({
      apiKey: openAiApiKey,
    });

    const conversation = await openai.conversations.create();
    return conversation;
  } catch (error) {
    console.error("Error creating OpenAI conversation:", error);
    throw error;
  }
});

/**
 * Callable function to get OpenAI response
 */
exports.getFeedback = onCall(async (request) => {
  console.log("request data:", request.data);

  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the prompt from the client-side request.
  const prompt = request.data.prompt;
  if (!prompt) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a prompt.",
    );
  }

  // Get the conversationId from the client-side request.
  const conversationId = request.data.conversationId;
  if (!conversationId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a conversationId.",
    );
  }

  // Get the message from the client-side request.
  const message = request.data.message;
  if (!message) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a message.",
    );
  }

  try {
    const openAiApiKey = await getSecret(firebaseConfig.messagingSenderId, openAiConfig.secretName);
    const openai = new OpenAI({
      apiKey: openAiApiKey,
    });
    const response = await openai.responses.parse({
      prompt,
      input: [{
        role: "user",
        content: message,
      }],
      conversation: conversationId,
    });
    console.log("OpenAI response:", response);
    const openBraceIndex = response.output_text.indexOf("{");
    const closeBraceIndex = response.output_text.lastIndexOf("}");
    return JSON.parse(response.output_text.slice(openBraceIndex, closeBraceIndex + 1).replaceAll("\n", ""));
  } catch (error) {
    console.error("Error getting feedback:", error);
    throw error;
  }
});

/**
 * Initialize Stripe with secret key from Secret Manager
 * @return {Promise<string>} secret key
 */
async function initializeStripe() {
  const stripeSecretKey = await getSecret(firebaseConfig.messagingSenderId, stripeInfo.STRIPE_SECRET_KEY_NAME);

  const stripe = stripeLib(stripeSecretKey, {
    apiVersion: "2020-08-27",
    appInfo: {
      name: "Chatter Up!",
      version: "1.0.0",
      url: "https://chatterup.net",
    },
  });
  return Promise.resolve(stripe);
}

/**
 * Callable function to fetch Stripe subscription plan
 */
exports.getPlanDetails = onCall(async (request, response) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the planId from the client-side request
  const planId = request.data.planId;
  if (!planId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a planId.",
    );
  }

  try {
    const stripe = await initializeStripe();
    const plan = await stripe.plans.retrieve(planId);
    return {
      publishableKey: stripeInfo.STRIPE_PUBLISHABLE_KEY,
      plan,
    };
  } catch (error) {
    console.error("Error fetching Stripe plans:", error);
    throw error;
  }
});

/**
 * Callable function to create a Stripe Customer
 */
exports.createStripeCustomer = onCall(async (request, response) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the name from the client-side request
  const name = request.data.name;
  if (!name) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with an name.",
    );
  }

  // Get the email from the client-side request
  const email = request.data.email;
  if (!email) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with an email.",
    );
  }

  try {
    const stripe = await initializeStripe();
    const customer = await stripe.customers.create({
      name,
      email,
    });

    // Create a SetupIntent to set up our payment methods recurring usage
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      customer: customer.id,
    });

    return {customer, setupIntent};
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
});

/**
 * Callable function to create Stripe Subscription
 */
exports.createStripeSubscription = onCall(async (request, response) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the customerId from the client-side request
  const customerId = request.data.customerId;
  if (!customerId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a customerId.",
    );
  }

  // Get the paymentMethodId from the client-side request
  const paymentMethodId = request.data.paymentMethodId;
  if (!paymentMethodId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a paymentMethodId.",
    );
  }

  // Get the planId from the client-side request
  const planId = request.data.planId;
  if (!planId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a planId.",
    );
  }

  try {
    const stripe = await initializeStripe();
    // Set the default payment method on the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{plan: planId}],
      expand: ["latest_invoice.payment_intent"],
      trial_period_days: 3,
    });
    return subscription;
  } catch (error) {
    console.error("Error creating Stripe subscription:", error);
    throw error;
  }
});


/**
 * Callable function to get a Stripe customer's entitlements
 */
exports.getStripeCustomerEntitlements = onCall(async (request, response) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the customerId from the client-side request
  const customerId = request.data.customerId;
  if (!customerId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a customerId.",
    );
  }

  try {
    const stripe = await initializeStripe();
    const activeEntitlements = await stripe.entitlements.activeEntitlements.list({
      customer: customerId,
    });
    return activeEntitlements;
  } catch (error) {
    console.error("Error in getStripeCustomerEntitlements:", error);
    throw error;
  }
});

/**
 * Callable function to configure Stripe Billing Portal session
 */
exports.createBillingPortalSession = onCall(async (request, response) => {
  // Validate that the request came from an authenticated user.
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Get the customerId from the client-side request
  const customerId = request.data.customerId;
  if (!customerId) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a customerId.",
    );
  }

  // Get the returnUrl from the client-side request
  const returnUrl = request.data.returnUrl;
  if (!returnUrl) {
    throw new HttpsError(
        "invalid-argument",
        "The function must be called with a returnUrl.",
    );
  }

  try {
    const stripe = await initializeStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    console.error("Error creating Billing Portal session:", error);
    throw error;
  }
});

/**
 * Webhooks endpoint to handle Stripe events
 */
exports.stripeWebhook = onRequest(async (request, response) => {
  // const webhookSecret = "whsec_6f83d8be450c0b4401e95c6829efbf8403491af37e5992e844679aca22615f18";
  const webhookSecret = await getSecret(firebaseConfig.messagingSenderId, stripeInfo.WHS_NAME);

  // Retrieve the event by verifying the signature using the raw body and secret.
  let event;

  try {
    const stripe = await initializeStripe();
    event = stripe.webhooks.constructEvent(
        request.body,
        request.headers["stripe-signature"],
        webhookSecret,
    );
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Extract the object from the event.
  const dataObject = event.data.object;
  console.log("Received Stripe event with data object:", dataObject);

  const context = event.context;
  console.log("Event context:", context);

  // Handle the event
  // Review important events for Billing webhooks
  // https://stripe.com/docs/billing/webhooks
  // Remove comment to see the various objects sent for this sample
  switch (event.type) {
    case "customer.created":
      console.log(`✅ Successfully created customer: ${dataObject.id}`);
      break;
    case "customer.deleted":
      console.log(`✅ Successfully deleted customer: ${dataObject.id}`);
      break;
    case "checkout.session.completed": {
      // Payment is successful and the subscription is created.
      const userRef = db.collection(USERS_COLLECTION).doc(dataObject.client_reference_id);

      // You should provision the subscription and save the customer ID to your database.
      const customerId = dataObject.customer;
      const stripe = await initializeStripe();
      const subscription = await stripe.Subscription.retrieve(dataObject.subscription);
      const planId = subscription.items.data[0].price.id;

      await userRef.update({
        stripeCustomerId: customerId,
        stripePlanId: planId,
        subscriptionStatus: subscription.status,
      });
      console.log(`✅ Checkout session completed for customer: ${customerId}`);
      break;
    }
    case "invoice.paid": {
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      const invoiceRef = db.collection(INVOICES_COLLECTION).doc(dataObject.id);
      await invoiceRef.set({
        id: dataObject.id,
        customerId: dataObject.customer,
        amountPaid: dataObject.amount_paid,
        status: dataObject.status,
        created: dataObject.created,
      });
      break;
    }
    case "invoice.payment_failed": {
      // The payment failed or the customer doesn't have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      const user = await db.collection(USERS_COLLECTION).where("stripeId", "==", dataObject.customer).get();
      if (!user.empty) {
        const userDoc = user.docs[0];
        await userDoc.ref.update({subscriptionStatus: "past_due"});
        console.log(`⚠️  Payment failed for customer: ${dataObject.customer}, user ID: ${userDoc.id}`);
      }
      break;
    }
    case "setup_intent.created":
      // console.log(dataObject);
      break;
    case "invoice.upcoming":
      // console.log(dataObject);
      break;
    case "invoice.created":
      // console.log(dataObject);
      break;
    case "invoice.finalized":
      // console.log(dataObject);
      break;
    case "invoice.payment_succeeded":
      console.log(dataObject);
      break;
    case "customer.subscription.created":
      console.log(`✅ Successfully created subscription: ${dataObject.id}`);
      break;
    case "customer.subscription.deleted": {
      console.log(`✅ Successfully deleted subscription: ${dataObject.id}`);

      // Subscription was canceled.
      const userRef = db.collection(USERS_COLLECTION).doc(dataObject.client_reference_id);

      // You should provision the subscription and save the customer ID to your database.
      const customerId = dataObject.customer;
      const stripe = await initializeStripe();
      const subscription = await stripe.Subscription.retrieve(dataObject.subscription);
      const planId = subscription.items.data[0].price.id;

      await userRef.update({stripePlanId: planId, subscriptionStatus: subscription.status});
      console.log(`✅ Subscription canceled for customer: ${customerId}`);
      break;
    }
    // ... handle other event types
    default:
      console.warn("Unexpected event:", event, "data object:", dataObject);
  }
  return {received: true};
});
