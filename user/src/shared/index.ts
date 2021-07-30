// export * from '../../../functions/shared';
export const allPerks = [
  {
    Name: 'Netflix Standard',
    Cost: 13.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInq1KuQQHSHZsmq9prpaUr',
    Img: 'netflix.jpg',
    Product: 'prod_JwhE2ADq37oUrZ',
    NetworkId: '123',
    PaymentName: 'Netflix Standard',
  },
  {
    Name: 'Hulu',
    Cost: 5.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInpWKuQQHSHZsmOtbkmnD6',
    Img: 'hulu.png',
    Product: 'prod_JwhD1f77sqFDSI',
    NetworkId: '123',
    PaymentName: 'Hulu',
  },
  {
    Name: 'Audible Plus',
    Cost: 7.95,
    Period: 'Monthly',
    stripePriceId: 'price_1JInpEKuQQHSHZsmZRfkYK13',
    Img: 'audible.png',
    Product: 'prod_JwhDvuPn93HnCv',
    NetworkId: '123',
    PaymentName: 'Audible Plus',
  },
  {
    Name: 'Disney Plus',
    Cost: 7.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInoaKuQQHSHZsmN9CMDEEu',
    Img: 'disneyplus.png',
    Product: 'prod_JwhDWSPG0Ydeua',
    NetworkId: '123',
    PaymentName: 'Disney Plus',
  },
  {
    Name: 'Headspace',
    Cost: 12.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInnAKuQQHSHZsm22WmEyqN',
    Img: 'headspace.png',
    Product: 'prod_JwhBWFAWY4QwSw',
    NetworkId: '123',
    PaymentName: 'Headspace',
  },
  {
    Name: 'Spotify Individual',
    Cost: 9.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInl6KuQQHSHZsmwMGzzFUE',
    Img: 'spotify.jpg',
    Product: 'prod_Jwh9zvjiY3Ou0n',
    NetworkId: '123',
    PaymentName: 'Spotify Individual',
  },
];

export const allPerksDict = allPerks.reduce(
  (map, perk) => (
    (map[perk.Name] = {
      Cost: perk['Cost'],
      Period: perk['Period'],
      Name: perk.Name,
      stripePriceId: perk.stripePriceId,
      PaymentName: perk.PaymentName,
      Product: perk.Product,
      NetworkId: perk.NetworkId,
    }),
    map
  ),
  {}
);
