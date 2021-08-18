#!/usr/bin/env bash

st -e sh -c "stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/issuingAuthorizationRequestWebhookHandler" &
st -e sh -c "stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/syncToFirestoreWebhookHandler" &
st -e sh -c "stripe listen --forward-to http://localhost:5001/perkify-5790b/us-central1/invoicePaidWebhookHandler" &

wait
