import { stripeWebhookSecret } from "../../configs";
import { db, stripe } from "../../models";
import { handleError } from "../../utils";
import { handleAuthorizationRequest } from "./handleAuthorizationRequest";

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      stripeWebhookSecret
    );
  } catch (err) {
    console.log(err);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }
  // console.log("event constructed");
  // console.log(event);

  try {
    if (event.type === "issuing_authorization.request") {
      const auth = event.data.object;
      await handleAuthorizationRequest(auth, response);
    }
  } catch (err) {
    await db
      .collection("transactions")
      .doc(event.data.object.id)
      .set(event.data.object);
    handleError(err, response);
  }

  // response.json({ received: true });
};
