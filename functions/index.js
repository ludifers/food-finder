const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { defineSecret } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");
const Stripe = require("stripe");

initializeApp();

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const PAID_SWIPE_CHOICE_PACK_SIZE = 20;

async function addSwipeChoices(session) {
  const userId = session.client_reference_id;

  if (!userId) {
    throw new Error("Missing client_reference_id on Stripe Checkout Session.");
  }

  const db = getFirestore();

  await Promise.all([
    db.doc(`users/${userId}/usage/swipeDecisions`).set(
      {
        paidChoicesRemaining: FieldValue.increment(PAID_SWIPE_CHOICE_PACK_SIZE),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
    db.doc(`users/${userId}/billing/status`).set(
      {
        choicePackSize: PAID_SWIPE_CHOICE_PACK_SIZE,
        checkoutSessionId: session.id,
        lastChoicePackPurchasedAt: FieldValue.serverTimestamp(),
        stripeCustomerId: session.customer || null,
      },
      { merge: true }
    ),
  ]);
}

exports.stripeWebhook = onRequest(
  {
    cors: false,
    region: "us-central1",
    secrets: [stripeSecretKey, stripeWebhookSecret],
  },
  async (request, response) => {
    if (request.method !== "POST") {
      response.set("Allow", "POST");
      response.status(405).send("Method Not Allowed");
      return;
    }

    const signature = request.get("stripe-signature");
    const stripe = new Stripe(stripeSecretKey.value());
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        stripeWebhookSecret.value()
      );
    } catch (error) {
      response.status(400).send(`Webhook signature failed: ${error.message}`);
      return;
    }

    try {
      if (event.type === "checkout.session.completed") {
        await addSwipeChoices(event.data.object);
      }

      response.json({ received: true });
    } catch (error) {
      console.error(error);
      response.status(500).send(error.message);
    }
  }
);
