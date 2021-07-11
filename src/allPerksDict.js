import allPerks from "./constants";

var allPerksDict = {};

allPerks.forEach((perk) => {
  allPerksDict[perk.Name] = {
    Cost: perk["Cost"],
    Period: perk["Period"],
    Name: perk.Name,
  };
});

export default allPerksDict;
