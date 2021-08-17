import { functions } from '../../../services';
import { expandUsers } from '../../../utils';

export const expandUsersWebhookHandler = functions.https.onRequest(
  async (req, res) => {
    const { business } = req.body as { business: Business };
    await expandUsers(business);
  }
);
