import {
  allDevelopmentPerks,
  allDevelopmentPerksByPriceIDDict,
  allDevelopmentPerksDict,
  allProductionPerks,
  allProductionPerksByPriceIDDict,
  allProductionPerksDict,
  developmentCardMaintenancePerk,
  developmentTaxRates,
  productionCardMaintenancePerk,
  productionTaxRates,
} from './constants';
const environment = process.env.FIREBASE_STRIPE_ENVIRONMENT;

export const allPerks =
  environment == 'production' ? allProductionPerks : allDevelopmentPerks;

export const allPerksDict =
  environment == 'production'
    ? allProductionPerksDict
    : allDevelopmentPerksDict;

export const allPerksByPriceIDDict =
  environment == 'production'
    ? allProductionPerksByPriceIDDict
    : allDevelopmentPerksByPriceIDDict;

export const cardMaintenancePerk =
  environment == 'production'
    ? productionCardMaintenancePerk
    : developmentCardMaintenancePerk;

export const taxRates =
  environment == 'production' ? productionTaxRates : developmentTaxRates;
