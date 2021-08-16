import { restApi } from './routes';
import {
  expandUsersWebhookHandler,
  issuingAuthorizationRequestWebhookHandler,
  invoicePaidWebhookHandler,
  syncToFirestoreWebhookHandler,
} from './webhooks';

// rest api endpoint
exports.rest = restApi;

// endpoint for expanding users when invoice becomes available
exports.expandUsersWebhookHandler = expandUsersWebhookHandler;

// endpoint for handling issuing authorization requests
exports.issuingAuthorizationRequestWebhookHandler =
  issuingAuthorizationRequestWebhookHandler;

// endpoint for generating expandUser tasks when an invoice is paid
exports.invoicePaidWebhookHandler = invoicePaidWebhookHandler;

// synchronize events from stripe into firestore
exports.syncToFirestoreWebhookHandler = syncToFirestoreWebhookHandler;
