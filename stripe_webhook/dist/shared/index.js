"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxRates = exports.cardMaintenancePerk = exports.allPerksByPriceIDDict = exports.allPerksDict = exports.allPerks = void 0;
const services_1 = require("../services");
const constants_1 = require("./constants");
exports.allPerks = services_1.environment == 'production' ? constants_1.allProductionPerks : constants_1.allDevelopmentPerks;
exports.allPerksDict = services_1.environment == 'production'
    ? constants_1.allProductionPerksDict
    : constants_1.allDevelopmentPerksDict;
exports.allPerksByPriceIDDict = services_1.environment == 'production'
    ? constants_1.allProductionPerksByPriceIDDict
    : constants_1.allDevelopmentPerksByPriceIDDict;
exports.cardMaintenancePerk = services_1.environment == 'production'
    ? constants_1.productionCardMaintenancePerk
    : constants_1.developmentCardMaintenancePerk;
exports.taxRates = services_1.environment == 'production' ? constants_1.productionTaxRates : constants_1.developmentTaxRates;
//# sourceMappingURL=index.js.map