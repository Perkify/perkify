export interface PerkifyError {
  status: number;
  reason: string;
  reasonDetail: string;
}

export interface SimpleCardPaymentMethod {
  brand: string;
  country: string;
  expMonth: number;
  expYear: number;
  funding: string;
  last4: string;
}

export interface Admin {
  businessID: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PerkGroup {
  perkNames: string[];
  emails: string[];
}

export interface BillingAddress {
  city: string;
  country: string;
  line1: string;
  // can we make this non optional?
  line2?: string;
  postal_code: string;
  state: string;
}

export interface Business {
  // business ref id
  businessID: string;
  // business name
  name: string;
  // admin ids
  admins: string[];
  // billing address
  billingAddress: BillingAddress;
  // stripe info
  stripeId: string;
  stripeLink: string;

  cardPaymentMethods: SimpleCardPaymentMethod[];
  // perk group names with their perkNames and emails
  // this will have scaling problems if there are lots of emails in a business
  // but the number of emails shouldn't be too high
  perkGroups: {
    [key: string]: PerkGroup;
  };
}

// FirebaseFirestore.Timestamp
type PerkUses = any[];
export interface PerkUsesDict {
  [key: string]: PerkUses;
}

export interface SimpleUser {
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
}

export interface UserCard {
  id: string;
  cardholderID: string;
  number: string;
  cvc: string;
  exp: {
    month: number;
    year: number;
  };
  billing: {
    address: BillingAddress;
  };
}

export interface User {
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
  firstName?: string;
  lastName?: string;
  card?: UserCard;
}

export interface ActivatedUser {
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
  firstName: string;
  lastName: string;
  card: UserCard;
}

export interface UserToCreate {
  email: string;
  businessID: string;
  perkGroupName: string;
  newPerkNames: string[];
}

export interface UserToUpdate {
  email: string;
  newPerkNames: string[];
  oldPerkUsesDict: {
    [key: string]: PerkUses;
  };
}

export interface UserToDelete {
  email: string;
  card?: UserCard;
}

// TODO camelCase keys
export interface PerkDefinition {
  Name: string;
  Cost: number;
  Period: string;
  stripePriceId: string;
  Img: string;
  Product: string;
  NetworkId: string;
  PaymentName: string;
}

export interface PerkDefinitionsDict {
  [key: string]: PerkDefinition;
}

export interface ExpandUsersPayload {
  business: Business;
}
