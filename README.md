
# Perkify Monorepo

### Testing

To test everything locally run:
- `cd functions && npm run start:all`
- `cd admin && npm run start:emulator`
- `cd user && npm run start:emulator`
- `stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/issuingAuthorizationRequestWebhookHandler`
- `stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/syncToFirestoreWebhookHandler`
- `stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/invoicePaidWebhookHandler`

You will need to install the stripe cli: https://stripe.com/docs/stripe-cli
