interface CostBreakdownRow {
  perkName: string;
  quantity: number;
  price: number;
  amount: number;
}

interface SubscriptionPrices {
  subtotal: number;
  volumeFee: number;
  cardMaintenanceFee: number;
  total: number;
}
