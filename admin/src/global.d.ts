import Stripe from 'stripe';
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
  default: boolean;
  fingerprint: string;
  paymentMethodID: string;
}

interface Admin {
  businessID: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface PerkGroup {
  perkNames: string[];
  userEmails: string[];
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

type User = {
  email: string;
  businessID: string;
  perkGroupName: string;
  perkUsesDict: PerkUsesDict;
  firstName?: string;
  lastName?: string;
  card?: UserCard;
};

type ActivatedUser = Required<User>;

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

interface ExpandUsersPayload {
  business: Business;
}

// api payloads

interface RegisterAdminAndBusinessPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
}

interface RegisterUserPayload {
  firstName: string;
  lastName: string;
}

interface CreatePortalLinkPayload {
  returnUrl: string;
}

interface CreatePerkGroupPayload {
  perkNames: string[];
  userEmails: string[];
}

interface UpdatePerkGroupPayload {
  perkNames: string[];
  userEmails: string[];
}

interface AddPaymentMethodPayload {
  paymentMethodID: string;
  useAsDefaultCreditCard: boolean;
}

interface Subscription {
  /**
   * Set of key-value pairs that you can attach to an object.
   * This can be useful for storing additional information about the object in a structured format.
   */
  metadata: {
    [name: string]: string;
  };
  stripeLink: string;
  role: string | null;
  quantity: number | null;
  items: Stripe.SubscriptionItem[];
  /**
   * Firestore reference to the product doc for this Subscription.
   */
  product: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  /**
   * Firestore reference to the price for this Subscription.
   */
  price: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  /**
   * Array of price references. If you prvoide multiple recurring prices to the checkout session via the `line_items` parameter,
   * this array will hold the references for all recurring prices for this subscription. `price === prices[0]`.
   */
  prices: Array<
    FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>
  >;
  /**
   * The status of the subscription object
   */
  status:
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid';
  /**
   * If true the subscription has been canceled by the user and will be deleted at the end of the billing period.
   */
  cancel_at_period_end: boolean;
  /**
   * Time at which the object was created.
   */
  created: FirebaseFirestore.Timestamp;
  /**
   * Start of the current period that the subscription has been invoiced for.
   */
  current_period_start: FirebaseFirestore.Timestamp;
  /**
   * End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
   */
  current_period_end: FirebaseFirestore.Timestamp;
  /**
   * If the subscription has ended, the timestamp of the date the subscription ended.
   */
  ended_at: FirebaseFirestore.Timestamp | null;
  /**
   * A date in the future at which the subscription will automatically get canceled.
   */
  cancel_at: FirebaseFirestore.Timestamp | null;
  /**
   * If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with `cancel_at_period_end`, `canceled_at` will still reflect the date of the initial cancellation request, not the end of the subscription period when the subscription is automatically moved to a canceled state.
   */
  canceled_at: FirebaseFirestore.Timestamp | null;
  /**
   * If the subscription has a trial, the beginning of that trial.
   */
  trial_start: FirebaseFirestore.Timestamp | null;
  /**
   * If the subscription has a trial, the end of that trial.
   */
  trial_end: FirebaseFirestore.Timestamp | null;
}
