import { NextFunction, Request, Response } from 'express';

// to be used with
// [validateFirebaseIdToken, validateAdminDoc, validateBusinessDoc]

export interface AdminPerkifyContext {
  businessID: string;
  businessData: Business;
  adminData: Admin;
  user: {
    email: string;
    uid: string;
  };
}

export type PartialAdminPerkifyRequest = Request & Partial<AdminPerkifyContext>;
export type AdminPerkifyRequest = Request & AdminPerkifyContext;
export type AdminPerkifyHandler = (
  req: AdminPerkifyRequest,
  res: Response,
  next: NextFunction
) => any;

export const adminPerkifyRequestTransform = (handler: AdminPerkifyHandler) => {
  return (
    req: PartialAdminPerkifyRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (
      'businessID' in req &&
      'businessData' in req &&
      'adminData' in req &&
      'user' in req
    ) {
      return handler(req as AdminPerkifyRequest, res, next);
    } else {
      const error = {
        status: 500,
        reason: "Couldn't generate context",
        reasonDetail: "Couldn't generate context",
      } as PerkifyError;
      return error;
    }
  };
};

export interface UserPerkifyContext {
  businessID: string;
  businessData: Business;
  userData: User;
  user: {
    email: string;
    uid: string;
  };
}

export type PartialUserPerkifyRequest = Request & Partial<UserPerkifyContext>;
export type UserPerkifyRequest = Request & UserPerkifyContext;

export type UserPerkifyHandler = (
  req: UserPerkifyRequest,
  res: Response,
  next: NextFunction
) => any;

export const userPerkifyRequestTransform = (handler: UserPerkifyHandler) => {
  return (
    req: PartialAdminPerkifyRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (
      'businessID' in req &&
      'businessData' in req &&
      'userData' in req &&
      'user' in req
    ) {
      return handler(req as UserPerkifyRequest, res, next);
    } else {
      const error = {
        status: 500,
        reason: "Couldn't generate context",
        reasonDetail: "Couldn't generate context",
      } as PerkifyError;
      return error;
    }
  };
};

export interface BusinessPerkifyContext {
  businessID: string;
  businessData: Business;
}
export type PartialBusinessPerkifyRequest = Request &
  Partial<BusinessPerkifyContext>;
export type BusinessPerkifyRequest = Request & BusinessPerkifyContext;
