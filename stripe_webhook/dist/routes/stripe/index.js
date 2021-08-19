"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhooks = void 0;
const configs_1 = require("../../configs");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const handleAuthorizationRequest_1 = require("./handleAuthorizationRequest");
const stripeWebhooks = async (request, response) => {
    const sig = request.headers["stripe-signature"];
    let event;
    console.log("event construction");
    console.log(sig);
    console.log(configs_1.stripeWebhookSecret);
    // console.log(request.body);
    // console.log(request.rawBody);
    try {
        event = models_1.stripe.webhooks.constructEvent(request.rawBody, sig, configs_1.stripeWebhookSecret);
    }
    catch (err) {
        console.log(err);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("event constructed");
    console.log(event);
    // event = { type: "issuing_authorization.request", data: { object: "" } };
    try {
        if (event.type === "issuing_authorization.request") {
            const auth = event.data.object;
            await handleAuthorizationRequest_1.handleAuthorizationRequest(auth, response);
        }
    }
    catch (err) {
        utils_1.handleError(err, response);
    }
    // response.json({ received: true });
};
exports.stripeWebhooks = stripeWebhooks;
//# sourceMappingURL=index.js.map