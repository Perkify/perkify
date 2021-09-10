export const allProductionPerks: PerkDefinition[] = [
  {
    Name: 'Netflix Standard',
    Cost: 13.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmDumwGzZO',
    Img: 'netflix.jpeg',
    Product: 'prod_K4UBKT9PixGkHS',
    NetworkId: '123',
    PaymentName: 'Netflix Standard',
    BillingInstructionsURL: 'https://help.netflix.com/en/node/244',
  },
  {
    Name: 'Hulu',
    Cost: 5.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmONWkPuco',
    Img: 'hulu.png',
    Product: 'prod_K4UBKT9PixGkHS',
    NetworkId: '123',
    PaymentName: 'Hulu',
    BillingInstructionsURL:
      'https://help.hulu.com/s/article/update-payment-information',
  },
  {
    Name: 'Audible Plus',
    Cost: 7.95,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsm4AKknHlG',
    Img: 'audible.png',
    Product: 'prod_K4UBKT9PixGkHS',
    NetworkId: '123',
    PaymentName: 'Audible Plus',
    BillingInstructionsURL:
      'https://help.audible.ca/s/article/how-can-i-add-or-edit-my-credit-card?language=en_CA:w',
  },
  {
    Name: 'Disney Plus',
    Cost: 7.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmy9hQBoua',
    Img: 'disneyplus.png',
    Product: 'prod_K4UBKT9PixGkHS',
    NetworkId: '123',
    PaymentName: 'Disney Plus',
    BillingInstructionsURL:
      'https://help.disneyplus.com/csp?id=csp_article_content&sys_kb_id=21dda2fcdb0580100a2af56e0f96192f',
  },
  {
    Name: 'Headspace',
    Cost: 12.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmYkEC0shJ',
    Img: 'headspace.png',
    Product: 'prod_K4UBKT9PixGkHS',
    NetworkId: '123',
    PaymentName: 'Headspace',
    BillingInstructionsURL:
      'https://help.headspace.com/hc/en-us/articles/115008362508-How-can-I-update-my-payment-details-',
  },
  {
    Name: 'Spotify Individual',
    Cost: 9.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmsONWEqGC',
    Img: 'spotify.jpg',
    Product: 'prod_K4UBKT9PixGkHS',
    NetworkId: '123',
    PaymentName: 'Spotify Individual',
    BillingInstructionsURL:
      'https://support.spotify.com/us/article/update-payment-details/',
  },
];

export const allProductionPerksDict = allProductionPerks.reduce(
  (map, perk) => (
    (map[perk.Name] = {
      Cost: perk['Cost'],
      Period: perk['Period'],
      Name: perk.Name,
      Img: perk.Img,
      stripePriceId: perk.stripePriceId,
      PaymentName: perk.PaymentName,
      Product: perk.Product,
      NetworkId: perk.NetworkId,
      BillingInstructionsURL: perk.BillingInstructionsURL,
    }),
    map
  ),
  {} as PerkDefinitionsDict
);

export const allProductionPerksByPriceIDDict = allProductionPerks.reduce(
  (map, perk) => (
    (map[perk.stripePriceId] = {
      Cost: perk['Cost'],
      Period: perk['Period'],
      Name: perk.Name,
      Img: perk.Img,
      stripePriceId: perk.stripePriceId,
      PaymentName: perk.PaymentName,
      Product: perk.Product,
      NetworkId: perk.NetworkId,
      BillingInstructionsURL: perk.BillingInstructionsURL,
    }),
    map
  ),
  {} as PerkDefinitionsDict
);

export const allDevelopmentPerks: PerkDefinition[] = [
  {
    Name: 'Netflix Standard',
    Cost: 13.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmeSywK8YU',
    Img: 'netflix.jpeg',
    Product: 'prod_K0joFcwnLJ2uXG',
    NetworkId: '123',
    PaymentName: 'Netflix Standard',
    BillingInstructionsURL: 'https://help.netflix.com/en/node/244',
  },
  {
    Name: 'Hulu',
    Cost: 5.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmDtISKvuX',
    Img: 'hulu.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    NetworkId: '123',
    PaymentName: 'Hulu',
    BillingInstructionsURL:
      'https://help.hulu.com/s/article/update-payment-information',
  },
  {
    Name: 'Audible Plus',
    Cost: 7.95,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmhxvfp9Nj',
    Img: 'audible.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    NetworkId: '123',
    PaymentName: 'Audible Plus',
    BillingInstructionsURL:
      'https://help.audible.ca/s/article/how-can-i-add-or-edit-my-credit-card?language=en_CA',
  },
  {
    Name: 'Disney Plus',
    Cost: 7.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmcjOXLZQ5',
    Img: 'disneyplus.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    NetworkId: '123',
    PaymentName: 'Disney Plus',
    BillingInstructionsURL:
      'https://help.disneyplus.com/csp?id=csp_article_content&sys_kb_id=21dda2fcdb0580100a2af56e0f96192f',
  },
  {
    Name: 'Headspace',
    Cost: 12.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsm6MkAUBVb',
    Img: 'headspace.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    NetworkId: '123',
    PaymentName: 'Headspace',
    BillingInstructionsURL:
      'https://help.headspace.com/hc/en-us/articles/115008362508-How-can-I-update-my-payment-details-',
  },
  {
    Name: 'Spotify Individual',
    Cost: 9.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmZ5ARUKue',
    Img: 'spotify.jpg',
    Product: 'prod_K0joFcwnLJ2uXG',
    NetworkId: '123',
    PaymentName: 'Spotify Individual',
    BillingInstructionsURL:
      'https://support.spotify.com/us/article/update-payment-details/',
  },
];

export const allDevelopmentPerksDict = allDevelopmentPerks.reduce(
  (map, perk) => (
    (map[perk.Name] = {
      Cost: perk['Cost'],
      Period: perk['Period'],
      Name: perk.Name,
      Img: perk.Img,
      stripePriceId: perk.stripePriceId,
      PaymentName: perk.PaymentName,
      Product: perk.Product,
      NetworkId: perk.NetworkId,
      BillingInstructionsURL: perk.BillingInstructionsURL,
    }),
    map
  ),
  {} as PerkDefinitionsDict
);

export const allDevelopmentPerksByPriceIDDict = allDevelopmentPerks.reduce(
  (map, perk) => (
    (map[perk.stripePriceId] = {
      Cost: perk['Cost'],
      Period: perk['Period'],
      Name: perk.Name,
      Img: perk.Img,
      stripePriceId: perk.stripePriceId,
      PaymentName: perk.PaymentName,
      Product: perk.Product,
      NetworkId: perk.NetworkId,
      BillingInstructionsURL: perk.BillingInstructionsURL,
    }),
    map
  ),
  {} as PerkDefinitionsDict
);

export const productionTaxRates = {
  perkifyTax: {
    stripeTaxID: 'txr_1JQwiMKuQQHSHZsmmD7Gf99O',
  },
};

export const developmentTaxRates = {
  perkifyTax: {
    stripeTaxID: 'txr_1JQwiHKuQQHSHZsmAxTOyFTH',
  },
};

export const productionCardMaintenancePerk: PrivatePerkDefinition = {
  name: 'Perkify Cost Per Employee',
  cost: 3.99,
  period: 'Monthly',
  stripePriceID: 'price_1JQwT3KuQQHSHZsm3VUYAo7Z',
  stripeProductID: 'prod_K4UBKT9PixGkHS',
};

export const developmentCardMaintenancePerk: PrivatePerkDefinition = {
  name: 'Perkify Cost Per Employee',
  cost: 3.99,
  period: 'Monthly',
  stripePriceID: 'price_1JQwShKuQQHSHZsmuKAJ3Xej',
  stripeProductID: 'prod_K0joFcwnLJ2uXG',
};
