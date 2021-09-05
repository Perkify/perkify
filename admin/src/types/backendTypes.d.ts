import { NextFunction, Request, Response } from 'express';

declare global {
  // admin requests

  interface AdminPerkifyContext {
    businessID: string;
    businessData: Business;
    adminData: Admin;
    user: {
      email: string;
      uid: string;
    };
  }

  type PartialAdminPerkifyRequest = Request & Partial<AdminPerkifyContext>;

  type AdminPerkifyRequest = Request & AdminPerkifyContext;

  type AdminPerkifyHandler = (
    req: AdminPerkifyRequest,
    res: Response,
    next: NextFunction
  ) => any;

  // user requests
  interface UserPerkifyContext {
    businessID: string;
    businessData: Business;
    userData: User;
    user: {
      email: string;
      uid: string;
    };
  }

  type PartialUserPerkifyRequest = Request & Partial<UserPerkifyContext>;

  type UserPerkifyRequest = Request & UserPerkifyContext;

  type UserPerkifyHandler = (
    req: UserPerkifyRequest,
    res: Response,
    next: NextFunction
  ) => any;

  // business requests

  interface BusinessPerkifyContext {
    businessID: string;
    businessData: Business;
  }

  type PartialBusinessPerkifyRequest = Request &
    Partial<BusinessPerkifyContext>;

  type BusinessPerkifyRequest = Request & BusinessPerkifyContext;

  // types for user manipulation
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
}
