"use strict";
// import admin from "../models";
// --------------- Middleware/Helpers --------------- //
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const handleError = (err, res) => {
    if (typeof err !== "object" || typeof err.status !== "number") {
        err = {
            status: 500,
            reason: "INTERNAL_SERVER_ERROR",
            reasonDetail: err ? err.toString() : undefined,
        };
    }
    console.error(err);
    res.status(err.status).json(err).end();
};
exports.handleError = handleError;
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
// export const validateFirebaseIdToken = async (req, res, next) => {
//   if (
//     (!req.headers.authorization ||
//       !req.headers.authorization.startsWith("Bearer ")) &&
//     !(req.cookies && req.cookies.__session)
//   ) {
//     const err = {
//       status: 403,
//       reason: "Unauthorized",
//       reasonDetail:
//         "No Firebase ID token was passed as a Bearer token in the Authorization header or as cookie",
//     };
//     handleError(err, res);
//     return;
//   }
//
//   let idToken;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer ")
//   ) {
//     // Read the ID Token from the Authorization header.
//     idToken = req.headers.authorization.split("Bearer ")[1];
//   } else if (req.cookies) {
//     // Read the ID Token from cookie.
//     idToken = req.cookies.__session;
//   } else {
//     // No cookie
//     const err = {
//       status: 403,
//       reason: "Unauthorized",
//     };
//     handleError(err, res);
//     return;
//   }
//
//   try {
//     const decodedIdToken = await admin.auth().verifyIdToken(idToken);
//     req.user = decodedIdToken;
//     next();
//     return;
//   } catch (error) {
//     console.error("Error while verifying Firebase ID token:", error);
//     const err = {
//       status: 403,
//       reason: "Unauthorized",
//     };
//     handleError(err, res);
//     return;
//   }
// };
//# sourceMappingURL=middleware.js.map