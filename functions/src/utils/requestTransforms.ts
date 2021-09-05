import { NextFunction, Response } from 'express';

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
        reasonDetail: `Couldn't generate context for ${
          req.businessID
        }. ${JSON.stringify(req.businessData)}, ${JSON.stringify(
          req.adminData
        )}, ${JSON.stringify(req.user)}`,
      } as PerkifyError;
      return next(error);
    }
  };
};

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
      return next(error);
    }
  };
};
