// import { Request } from "express"
// import { auth } from "../models";
// how do we image big companies using perkify?
// big company signs up and pays for all of its subteams?
// or subteams sign themselves up?

// we don't want an email to have docs in multiple businesses,
// because then how do we know where to look. How does that code work right now? I'll have to take a look

// users
// don't store everything in a business document. Instead use another subcollection that is a duplicate0

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
}

interface Admin {
  businessID: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface PerkGroup {
  perkNames: string[];
  emails: string[];
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

type PerkUses = FirebaseFirestore.Timestamp[];
interface PerkUsesDict {
  [key: string]: PerkUses;
}

interface SimpleUser {
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
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

interface User {
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
  firstName?: string;
  lastName?: string;
  card?: UserCard;
}

interface ActivatedUser {
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
  firstName: string;
  lastName: string;
  card: UserCard;
}

interface UserToCreate {
  email: string;
  businessID: string;
  perkGroupName: string;
  newPerkNames: string[];
}

interface UserToUpdate {
  email: string;
  newPerkNames: string[];
  oldPerkUsesDict: {
    [key: string]: PerkUses;
  };
}

interface UserToDelete {
  email: string;
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
