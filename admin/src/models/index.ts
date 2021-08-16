// how do we image big companies using perkify?
// big company signs up and pays for all of its subteams?
// or subteams sign themselves up?

// we don't want an email to have docs in multiple businesses,
// because then how do we know where to look. How does that code work right now? I'll have to take a look

// users
// don't store everything in a business document. Instead use another subcollection that is a duplicate0

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
  perks: string[];
  employees: string[];
}

export interface Business {
  // business ref id
  id: string;
  // business name
  name: string;
  // admin ids
  admins: string[];
  // billing address
  billingAddress: {
    city: string;
    country: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
  };

  // stripe info
  stripeId: string;
  stripeLink: string;

  cardPaymentMethods: SimpleCardPaymentMethod[];
  // group names with their perks and employees
  // this will have scaling problems if there are lots of employees
  // but the number of employees shouldn't be too high
  perkGroups: {
    [key: string]: PerkGroup;
  };
}

export interface User {
  businessID: string;
  perkGroup: string;
  perks: {
    [key: string]: string[];
  };
}

// flow, whenever admin makes a change it instantly updates the business doc
// for perk group deletion, employee removal, and perk removal, changes are instantly applied to the users
// then once the payment goes through, possible actions are to:
// - create a perk group. CREATE action
// - add employees to an existing perk group with a specified set of perks, UPDATE action. Apply snapshot of a perk group
// - add perks to an existing perk group, UPDATE action. Apply snapshot of a perk group.

// should we move users to be a subcollection of a business? I think that makes sense

// there are some errors we just want to send to the client, and some that we want to log for our own debugging
