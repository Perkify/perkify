import { restApi } from './routes';
import {
  expandUsersWebhookHandler,
  syncToFirestoreWebhookHandler,
} from './webhooks';

// rest api endpoint
exports.rest = restApi;

// TODO update stripe webhook endpoints to match new definitions

// endpoint for expanding users when invoice becomes available
exports.expandUsersWebhookHandler = expandUsersWebhookHandler;

// synchronize events from stripe into firestore
exports.syncToFirestoreWebhookHandler = syncToFirestoreWebhookHandler;
