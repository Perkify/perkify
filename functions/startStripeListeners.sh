#!/usr/bin/env bash

stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/issuingAuthorizationRequestWebhookHandler &
stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/invoicePaidWebhookHandler &
stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/syncToFirestoreWebhookHandler &

wait
