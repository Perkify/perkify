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
  perks: string[];
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
  // perk group names with their perks and emails
  // this will have scaling problems if there are lots of emails in a business
  // but the number of emails shouldn't be too high
  perkGroups: {
    [key: string]: PerkGroup;
  };
}

type PerkUses = string[];
interface PerkUsesDict {
  [key: string]: PerkUses;
}

interface SimpleUser {
  businessID: string;
  perkGroupName: string;
  perks: PerkUsesDict;
}

interface User {
  businessID: string;
  perkGroupName: string;
  perks: PerkUsesDict;
  firstName: string;
  lastName: string;
  card: {
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
  };
}

interface UserToCreate {
  email: string;
  businessID: string;
  perkGroupName: string;
  newPerks: string[];
}

interface UserToUpdate {
  email: string;
  newPerks: string[];
  oldPerks: {
    [key: string]: PerkUses;
  };
}

interface UserToDelete {
  email: string;
}

// flow, whenever admin makes a change it instantly updates the business doc
// for perk group deletion, employee removal, and perk removal, changes are instantly applied to the users
// then once the payment goes through, possible actions are to:
// - create a perk group. CREATE action
// - add employees to an existing perk group with a specified set of perks, UPDATE action. Apply snapshot of a perk group
// - add perks to an existing perk group, UPDATE action. Apply snapshot of a perk group.

// should we move users to be a subcollection of a business? I think that makes sense

// there are some errors we just want to send to the client, and some that we want to log for our own debugging

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
