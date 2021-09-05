import { allDevelopmentPerks, allProductionPerks } from './perkDefinitions';
import {
  privateDevelopmentPerks,
  privateProductionPerks,
} from './privatePerkDefinitions';

export const allPerks =
  process.env.FIREBASE_STRIPE_ENVIRONMENT == 'production'
    ? allProductionPerks
    : allDevelopmentPerks;

export const allPerksDict = allPerks.reduce(
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
    }),
    map
  ),
  {} as PerkDefinitionsDict
);

export const allPerksByPriceIDDict = allPerks.reduce(
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
    }),
    map
  ),
  {} as PerkDefinitionsDict
);

export const privatePerks =
  process.env.FIREBASE_STRIPE_ENVIRONMENT == 'production'
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

export const privatePerksByPriceIDDict = privatePerks.reduce(
  (map, perk) => (
    (map[perk.stripePriceID] = {
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
