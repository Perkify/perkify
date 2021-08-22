import { functions } from '../src/services';

interface PrivatePerkDefinition {
  name: string;
  cost: number;
  period: string;
  stripePriceID: string;
  stripeProductID: string;
}

interface PrivatePerkDefinitionsDict {
  [key: string]: PrivatePerkDefinition;
}

export const privateProductionPerks: PrivatePerkDefinition[] = [
  {
    name: 'Perkify Cost Per Employee',
    cost: 3.99,
    period: 'Monthly',
    stripePriceID: 'price_1JQwT3KuQQHSHZsm3VUYAo7Z',
    stripeProductID: 'prod_K4UBKT9PixGkHS',
  },
];

export const privateDevelopmentPerks: PrivatePerkDefinition[] = [
  {
    name: 'Perkify Cost Per Employee',
    cost: 3.99,
    period: 'Monthly',
    stripePriceID: 'price_1JQwShKuQQHSHZsmuKAJ3Xej',
    stripeProductID: 'prod_K0joFcwnLJ2uXG',
  },
];

export const privatePerks =
  functions.config()['stripe-firebase'].environment == 'production'
    ? privateProductionPerks
    : privateDevelopmentPerks;

export const privatePerksDict = privatePerks.reduce(
  (map, perk) => (
    (map[perk.name] = {
      cost: perk['cost'],
      period: perk['period'],
      name: perk.name,
      stripePriceID: perk.stripePriceID,
      stripeProductID: perk.stripeProductID,
    }),
    map
  ),
  {} as PrivatePerkDefinitionsDict
);
