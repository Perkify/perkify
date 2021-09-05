// simple card payment method
// used for storing payment methods in businesses
interface SimpleCardPaymentMethod {
  brand: string;
  country: string;
  expMonth: number;
  expYear: number;
  funding: string;
  last4: string;
  fingerprint: string;
  default: boolean;
  paymentMethodID: string;
}

// represents a businesses billing address
interface BillingAddress {
  city: string;
  country: string;
  line1: string;
  // can we make this non optional?
  line2?: string;
  postal_code: string;
  state: string;
}

// represents a perk group in a business
interface PerkGroup {
  perkNames: string[];
  userEmails: string[];
}

// represents a business
interface Business {
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

  cardPaymentMethods: { [key: string]: SimpleCardPaymentMethod };
  // perk group names with their perkNames and emails
  // this will have scaling problems if there are lots of emails in a business
  // but the number of emails shouldn't be too high
  perkGroups: {
    [key: string]: PerkGroup;
  };
}

// represents an admin
interface Admin {
  businessID: string;
  email: string;
  firstName: string;
  lastName: string;
}

// list of timestamps corresponding to perk uses
type PerkUses = FirebaseFirestore.Timestamp[];

// mapping from perk to corresponding perk uses
interface PerkUsesDict {
  [key: string]: PerkUses;
}

// for storing a user's virtual card
interface UserCard {
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

// User object
// firstName, lastName, and card are optional
type User = {
  email: string;
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
  firstName?: string;
  lastName?: string;
  card?: UserCard;
};

// once a user is activated, all types are required
type ActivatedUser = Required<User>;

// TODO camelCase keys
interface PerkDefinition {
  Name: string;
  Cost: number;
  Period: string;
  stripePriceId: string;
  Img: string;
  Product: string;
  NetworkId: string;
  PaymentName: string;
}

interface PerkDefinitionsDict {
  [key: string]: PerkDefinition;
}

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
