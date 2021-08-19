import { functions } from '../../../services';
import { expandUsers } from '../../../utils';

export const expandUsersWebhookHandler = functions.https.onRequest(
  async (req, res) => {
    const { business } = req.body as ExpandUsersPayload;
    await expandUsers(business);
    res.status(200).json({ received: true });
  }
);
