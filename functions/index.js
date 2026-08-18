const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { defineSecret } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");
const Stripe = require("stripe");

initializeApp();

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

async function unlockPremium(session) {
  const userId = session.client_reference_id;

  if (!userId) {
    throw new Error("Missing client_reference_id on Stripe Checkout Session.");
  }

  await getFirestore()
    .doc(`users/${userId}/billing/status`)
    .set(
      {
        checkoutSessionId: session.id,
        isPremium: true,
        premiumUnlockedAt: FieldValue.serverTimestamp(),
        stripeCustomerId: session.customer || null,
      },
      { merge: true }
    );
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
        await unlockPremium(event.data.object);
      }

      response.json({ received: true });
    } catch (error) {
      console.error(error);
      response.status(500).send(error.message);
    }
  }
);
