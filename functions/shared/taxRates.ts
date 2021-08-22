import { functions } from '../src/services';
const productionTaxRates = {
  perkifyTax: {
    stripeTaxID: 'txr_1JQwiMKuQQHSHZsmmD7Gf99O',
  },
};

const developmentTaxRates = {
  perkifyTax: {
    stripeTaxID: 'txr_1JQwiHKuQQHSHZsmAxTOyFTH',
  },
};

export const taxRates =
  functions.config()['stripe-firebase'].environment == 'production'
    ? productionTaxRates
    : developmentTaxRates;
