interface PerkifyError {
  status: number;
  reason: string;
  reasonDetail: string;
}

interface SimpleCardPaymentMethod {
  brand: string;
  country: string;
  expMonth: number;
  expYear: number;
  funding: string;
  last4: string;
  fingerprint: string;
}

interface Admin {
  businessID: string;
  adminID: string;
  email: string;
  firstName: string;
  lastName: string;
  isOwner: boolean;
}

// interface PerkGroup {
//   perkNames: string[];
//   userEmails: string[];
// }

interface PerkGroup {
  perkGroupName: string;
  employeeIDs: string[];
  perkNames: string[];
}

interface BillingAddress {
  city: string;
  country: string;
  line1: string;
  // can we make this non optional?
  line2?: string;
  postal_code: string;
  state: string;
}

interface Business {
  // business ref id
  businessID: string;
  // business name
  name: string;
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

// FirebaseFirestore.Timestamp
type PerkUses = any[];
interface PerkUsesDict {
  [key: string]: PerkUses;
}

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

type Employee = {
  // employeeID -> id
  email: string;
  businessID: string;
  perkGroupID: string;
  perkUsesDict: PerkUsesDict;
  firstName?: string;
  lastName?: string;
  card?: UserCard;
};

type ActivatedUser = Required<Employee>;

interface UserToCreate {
  email: string;
  employeeID: string;
  businessID: string;
  perkGroupID: string;
  newPerkNames: string[];
}

interface UserToUpdate {
  businessID: string;
  employeeID: string;
  perkGroupID: string;
  newPerkNames: string[];
  oldPerkUsesDict: {
    [key: string]: PerkUses;
  };
}

interface UserToDelete {
  businessID: string;
  employeeID: string;
  card?: UserCard;
}

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

interface ExpandUsersPayload {
  business: Business;
}
