
# Perkify Monorepo

### Development

There are three ways to do development. For all of them, make sure the firebase cli is configured to use the staging environment `firebase use staging`.

#### Frontend Testing

If you are just developing the admin or user dashboard frontend, you can run:
- `cd admin && npm run start:staging`
- `cd user && npm run start:staging`

This will start the admin dashboard at `http://localhost:3000` and the user dashboard at `http://localhost:3001`.

The local client will connect to:
- dev firebase auth
- dev firebase firestore
- dev firebase functions

Authentication
- After signing up for an admin account, an email will be sent with a link that you can use to verify your email and log in.
- After creating a user from the admin dashboard, you can look in the logs of the `invoicePaidWebhookHandler` on the dev firebase console for a sign in link to use for signing in to the user dashboard. The sign in link will redirect you to `app.dev.getperkify.com`. After redirection, change the `app.dev.getperkify.com` to `localhost:3001` in order to access the local user dashboard.

#### Limited Backend Testing

If you are testing parts of the backend that do not involve changes to webhook handlers, you can run:
- `cd functions && npm run start`
- `cd admin && npm run start`
- `cd user && npm run start`


The local client will connect to:
- dev firebase auth
- dev firebase firestore
- local firebase functions

The local firebase functions will connect to:
- dev firebase auth
- dev firebase firestore
- dev stripe

Authentication
- After signing up for an admin account, a link will be printed to the console where you are running the local firebase functions that you can use to verify your email and log in.
- After creating a user from the admin dashboard, you can look in the logs of the `invoicePaidWebhookHandler` on the dev firebase console for a sign in link to use for signing in to the user dashboard. The sign in link will redirect you to `app.dev.getperkify.com`. After redirection, change the `app.dev.getperkify.com` to `localhost:3001` in order to access the local user dashboard.


#### Full Testing Except Credit Card Authorization

If you want a clean firebase auth and firebase firestore, and are making breaking changes / changes to all parts of the code except the credit card authorization, you can run:
- `cd functions && npm run start:all`
- `cd admin && npm run start:emulator`
- `cd user && npm run start:emulator`
- `stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/syncToFirestoreWebhookHandler`
- `stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/invoicePaidWebhookHandler`


Authentication
- After signing up for an admin account, a link will be printed to the console where you are running the local firebase functions that you can use to verify your email and log in.
- After creating a user from the admin dashboard, a link will be printed to the console where you are running local firebase functions that you can use to verify your email and log in. The sign in link will redirect you to `localhost:3001` where the user dashboard will be running locally.

You will need to install the stripe cli: https://stripe.com/docs/stripe-cli

The local client will connect to:
- local firebase auth
- local firebase firestore
- local firebase functions

The local firebase functions will connect to:
- local firebase auth
- local firebase firestore
- dev stripe
