export const allProductionPerks: PerkDefinition[] = [
  {
    Name: 'Netflix Standard',
    Cost: 13.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmDumwGzZO',
    Img: 'netflix.jpeg',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL: 'https://help.netflix.com/en/node/244',
    NetworkId: '123',
    PaymentName: 'netflix',
    AuthHoldFields: [
      {
        keyPath: ['verification_data', 'cvc_check'],
        acceptedValues: ['not_provided'],
      },
    ],
  },
  {
    Name: 'Hulu',
    Cost: 6.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmONWkPuco',
    Img: 'hulu.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://help.hulu.com/s/article/update-payment-information',
    NetworkId: '395709102324',
    PaymentName: 'hulu',
    AuthHoldFields: [
      {
        keyPath: ['pending_request', 'amount'],
        acceptedValues: [100],
      },
    ],
  },
  {
    Name: 'Audible Plus',
    Cost: 7.95,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsm4AKknHlG',
    Img: 'audible.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://help.audible.ca/s/article/how-can-i-add-or-edit-my-credit-card?language=en_CA:w',
    NetworkId: '123',
    PaymentName: 'audible',
  },
  {
    Name: 'Disney Plus',
    Cost: 7.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmy9hQBoua',
    Img: 'disneyplus.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://help.disneyplus.com/csp?id=csp_article_content&sys_kb_id=21dda2fcdb0580100a2af56e0f96192f',
    NetworkId: '395704333146',
    PaymentName: 'disney',
  },
  {
    Name: 'Headspace',
    Cost: 12.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmYkEC0shJ',
    Img: 'headspace.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://help.headspace.com/hc/en-us/articles/115008362508-How-can-I-update-my-payment-details-',
    NetworkId: '123',
    PaymentName: 'headspace',
  },
  {
    Name: 'Spotify Individual',
    Cost: 9.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JQLCwKuQQHSHZsmsONWEqGC',
    Img: 'spotify.jpg',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://support.spotify.com/us/article/update-payment-details/',
    NetworkId: '420429000200209',
    PaymentName: 'spotify',
  },
  {
    Name: 'Leetcode Premium',
    Cost: 159.0,
    Period: 'Yearly',
    stripePriceId: 'price_1Jm0bkKuQQHSHZsmLZCTKcqm',
    Img: 'leetcode.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://help.audible.ca/s/article/how-can-i-add-or-edit-my-credit-card?language=en_CA:w',
    NetworkId: '123',
    PaymentName: 'leetcode',
  },
  {
    Name: 'Babbel',
    Cost: 30.0,
    Period: 'Monthly',
    stripePriceId: 'price_1KOnIVKuQQHSHZsmdaRSBA2K',
    Img: 'babbel.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://support.babbel.com/hc/en-us/articles/205600288-How-do-I-change-to-a-different-subscription-or-payment-plan-',
    NetworkId: '123',
    PaymentName: 'babbel',
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
      AuthHoldFields: perk?.AuthHoldFields,
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
    BillingInstructionsURL: 'https://help.netflix.com/en/node/244',
    NetworkId: '123',
    PaymentName: 'netflix',
    AuthHoldFields: [
      {
        keyPath: ['verification_data', 'cvc_check'],
        acceptedValues: ['not_provided'],
      },
    ],
  },
  {
    Name: 'Hulu',
    Cost: 6.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmDtISKvuX',
    Img: 'hulu.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    BillingInstructionsURL:
      'https://help.hulu.com/s/article/update-payment-information',
    NetworkId: '395709102324',
    PaymentName: 'hulu',
    AuthHoldFields: [
      {
        keyPath: ['pending_request', 'amount'],
        acceptedValues: [100],
      },
    ],
  },
  {
    Name: 'Audible Plus',
    Cost: 7.95,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmhxvfp9Nj',
    Img: 'audible.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    BillingInstructionsURL:
      'https://help.audible.ca/s/article/how-can-i-add-or-edit-my-credit-card?language=en_CA',
    NetworkId: '123',
    PaymentName: 'audible',
  },
  {
    Name: 'Disney Plus',
    Cost: 7.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmcjOXLZQ5',
    Img: 'disneyplus.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    BillingInstructionsURL:
      'https://help.disneyplus.com/csp?id=csp_article_content&sys_kb_id=21dda2fcdb0580100a2af56e0f96192f',
    NetworkId: '395704333146',
    PaymentName: 'disney',
  },
  {
    Name: 'Headspace',
    Cost: 12.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsm6MkAUBVb',
    Img: 'headspace.png',
    Product: 'prod_K0joFcwnLJ2uXG',
    BillingInstructionsURL:
      'https://help.headspace.com/hc/en-us/articles/115008362508-How-can-I-update-my-payment-details-',
    NetworkId: '123',
    PaymentName: 'headspace',
  },
  {
    Name: 'Spotify Individual',
    Cost: 9.99,
    Period: 'Monthly',
    stripePriceId: 'price_1JMiKdKuQQHSHZsmZ5ARUKue',
    Img: 'spotify.jpg',
    Product: 'prod_K0joFcwnLJ2uXG',
    BillingInstructionsURL:
      'https://support.spotify.com/us/article/update-payment-details/',
    NetworkId: '420429000200209',
    PaymentName: 'spotify',
  },
  {
    Name: 'Leetcode Premium',
    Cost: 159.0,
    Period: 'Yearly',
    stripePriceId: 'price_1Jm0cVKuQQHSHZsmGll7sZr5',
    Img: 'leetcode.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://help.audible.ca/s/article/how-can-i-add-or-edit-my-credit-card?language=en_CA:w',
    NetworkId: '123',
    PaymentName: 'leetcode',
  },
  {
    Name: 'Babbel',
    Cost: 30.0,
    Period: 'Monthly',
    stripePriceId: 'price_1KOnIVKuQQHSHZsmdaRSBA2K',
    Img: 'babbel.png',
    Product: 'prod_K4UBKT9PixGkHS',
    BillingInstructionsURL:
      'https://support.babbel.com/hc/en-us/articles/205600288-How-do-I-change-to-a-different-subscription-or-payment-plan-',
    NetworkId: '123',
    PaymentName: 'babbel',
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
      AuthHoldFields: perk?.AuthHoldFields,
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
