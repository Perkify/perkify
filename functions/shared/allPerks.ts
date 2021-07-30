export const allPerks = [
  {
    Name: 'Netflix Standard',
    Cost: 13.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInq1KuQQHSHZsmq9prpaUr',
    Img: 'netflix.jpg',
  },
  {
    Name: 'Hulu',
    Cost: 5.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInpWKuQQHSHZsmOtbkmnD6',
    Img: 'hulu.png',
  },
  {
    Name: 'Audible Plus',
    Cost: 7.95,
    Period: 'Monthly',
    stripePriceId: 'price_1JInpEKuQQHSHZsmZRfkYK13',
    Img: 'audible.png',
  },
  {
    Name: 'Disney Plus',
    Cost: 7.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInoaKuQQHSHZsmN9CMDEEu',
    Img: 'disneyplus.png',
  },
  {
    Name: 'Headspace',
    Cost: 12.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInnAKuQQHSHZsm22WmEyqN',
    Img: 'headspace.png',
  },
  {
    Name: 'Spotify Individual',
    Cost: 9.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JInl6KuQQHSHZsmwMGzzFUE',
    Img: 'spotify.jpg',
  },
];

export const allPerksDict = allPerks.reduce(
  (map, perk) => (
    (map[perk.Name] = {
      Cost: perk['Cost'],
      Period: perk['Period'],
      Name: perk.Name,
    }),
    map
  ),
  {}
);
