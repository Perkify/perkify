import { stripe } from '../../models';

export const listBalanceTransactions = async (req, res, next) => {
  const balanceTransactions = await stripe.balanceTransactions.list({
    limit: 3,
  });
  console.log(balanceTransactions);
  res.json(balanceTransactions).end();
};
