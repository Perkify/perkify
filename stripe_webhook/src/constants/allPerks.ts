interface PerkInfo {
  Name: string;
  Cost: number;
  Period: string;
  stripePriceId: string;
  Img: string;
  Product: string;
  NetworkId: string;
  // PaymentName: 'Netflix.com',
  PaymentName: string;
  AuthorizationHoldFields?: any;
}

export const allProductionPerks: PerkInfo[] = [
  {
    Name: "Netflix Standard",
    Cost: 1399,
    Period: "Monthly",
    stripePriceId: "price_1JJqw9KuQQHSHZsm71r4kkhd",
    Img: "netflix.jpeg",
    Product: "prod_JxmVIY3P8jV19L",
    NetworkId: "395707213988",
    // PaymentName: 'Netflix.com',
    PaymentName: "netflix",
    AuthorizationHoldFields: [
      {
        keyPath: ["verification_data", "cvc_check"],
        acceptedValues: ["not_provided"],
      },
      // {
      //   keyPath: ["merchant_data", "network_id"],
      //   acceptedValues: ["420429000201413", "686030000557165"],
      // },
      // {
      //   keyPath: ['amount'],
      //   values: [13.99 + 6],
      // },
      // {
      //   keyPath: ['merchant_data', 'name'],
      //   values: ['Netflix.com', 'NETFLIX.COM'],
      // },
    ],
  },
  {
    Name: "Hulu",
    Cost: 599,
    Period: "Monthly",
    stripePriceId: "price_1JJqwcKuQQHSHZsmQ2JFPQwp",
    Img: "hulu.png",
    Product: "prod_JxmV7NAPQLFyOl",
    NetworkId: "395709102324",
    // PaymentName: 'HLU*Hulu 2047849714872-U',
    PaymentName: "hulu",
    AuthorizationHoldFields: [
      {
        keyPath: ["pending_request", "amount"],
        acceptedValues: [100],
      },
    ],
  },
  {
    Name: "Audible Plus",
    Cost: 795,
    Period: "Monthly",
    stripePriceId: "price_1JJqwxKuQQHSHZsmosyOePOl",
    Img: "audible.png",
    Product: "prod_JxmVInB54WZwQp",
    NetworkId: "123",
    // PaymentName: 'Audible Plus',
    PaymentName: "audible",
  },
  {
    Name: "Disney Plus",
    Cost: 799,
    Period: "Monthly",
    stripePriceId: "price_1JJqpKKuQQHSHZsmZugC5Zxi",
    Img: "disneyplus.png",
    Product: "prod_JxmO9TVTtcHLd9",
    NetworkId: "395704333146",
    // PaymentName: 'DisneyPLUS',
    PaymentName: "disney",
  },
  {
    Name: "Headspace",
    Cost: 1299,
    Period: "Monthly",
    stripePriceId: "price_1JJqrcKuQQHSHZsmPSI9mrP0",
    Img: "headspace.png",
    Product: "prod_JxmQHmjecXibCK",
    NetworkId: "123",
    // PaymentName: 'Headspace',
    PaymentName: "headspace",
  },
  {
    Name: "Spotify Individual",
    Cost: 999,
    Period: "Monthly",
    stripePriceId: "price_1JJqs2KuQQHSHZsmfzgIOrJ3",
    Img: "spotify.jpg",
    Product: "prod_JxmQVILWLae2ZZ",
    NetworkId: "420429000200209",
    // PaymentName: 'Spotify Individual',
    PaymentName: "spotify",
  },
];

export const allDevelopmentPerks: PerkInfo[] = [
  {
    Name: "Netflix Standard",
    Cost: 13.99,
    Period: "Monthly",
    stripePriceId: "price_1JInq1KuQQHSHZsmq9prpaUr",
    Img: "netflix.jpg",
    Product: "prod_JwhE2ADq37oUrZ",
    NetworkId: "395707213988",
    PaymentName: "Netflix.com",
  },
  {
    Name: "Hulu",
    Cost: 5.99,
    Period: "Monthly",
    stripePriceId: "price_1JInpWKuQQHSHZsmOtbkmnD6",
    Img: "hulu.png",
    Product: "prod_JwhD1f77sqFDSI",
    NetworkId: "123",
    PaymentName: "Hulu",
  },
  {
    Name: "Audible Plus",
    Cost: 7.95,
    Period: "Monthly",
    stripePriceId: "price_1JInpEKuQQHSHZsmZRfkYK13",
    Img: "audible.png",
    Product: "prod_JwhDvuPn93HnCv",
    NetworkId: "123",
    PaymentName: "Audible Plus",
  },
  {
    Name: "Disney Plus",
    Cost: 7.99,
    Period: "Monthly",
    stripePriceId: "price_1JInoaKuQQHSHZsmN9CMDEEu",
    Img: "disneyplus.png",
    Product: "prod_JwhDWSPG0Ydeua",
    NetworkId: "123",
    PaymentName: "Disney Plus",
  },
  {
    Name: "Headspace",
    Cost: 12.99,
    Period: "Monthly",
    stripePriceId: "price_1JInnAKuQQHSHZsm22WmEyqN",
    Img: "headspace.png",
    Product: "prod_JwhBWFAWY4QwSw",
    NetworkId: "123",
    PaymentName: "Headspace",
  },
  {
    Name: "Spotify Individual",
    Cost: 9.99,
    Period: "Monthly",
    stripePriceId: "price_1JInl6KuQQHSHZsmwMGzzFUE",
    Img: "spotify.jpg",
    Product: "prod_Jwh9zvjiY3Ou0n",
    NetworkId: "123",
    PaymentName: "Spotify Individual",
  },
];

export const allPerks =
  process.env.NODE_ENV == "production"
    ? allProductionPerks
    : allDevelopmentPerks;

export const allPerksDict = allPerks.reduce(
  (map, perk) => (
    (map[perk.Name] = {
      Cost: perk["Cost"],
      Period: perk["Period"],
      Name: perk.Name,
      Img: perk.Img,
      stripePriceId: perk.stripePriceId,
      PaymentName: perk.PaymentName,
      Product: perk.Product,
      NetworkId: perk.NetworkId,
    }),
    map
  ),
  {}
);
