import { functions } from '../../../models';
import { expandUsers } from '../../../utils';

export const expandUsersWebhookHandler = functions.https.onRequest(
  async (req, res) => {
    const { business: oldBusiness } = req.body as { business };
    await expandUsers(oldBusiness);
  }
);
