"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const models_1 = require("./models");
const routes_1 = require("./routes");
const express = require("express");
const app = express();
// app.use(express.json());
// app.use((req, res, next) => {
//   if (req.originalUrl === "/webhook") {
//     next();
//   } else {
//     bodyParser.json()(req, res, next);
//   }
// });
app.get("/_ah/warmup", async (req, res) => {
    // Handle your warmup logic. Initiate db connection, etc.
    // get some random data to establish connection to db
    const userRef = models_1.db.collection("users").doc("g.cole.killian@gmail.com");
    const userData = (await userRef.get()).data();
    console.log("Warmup!");
    console.log(userData);
    res.status(200).end();
});
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    },
}));
app.use(function (req, res, next) {
    res.setHeader("Content-Type", "application/json");
    next();
});
app.post("/webhook", bodyParser.raw({ type: "application/json" }), routes_1.stripeWebhooks);
// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
//# sourceMappingURL=server.js.map