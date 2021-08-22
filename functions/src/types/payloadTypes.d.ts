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
