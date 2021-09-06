import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import { auth, db } from '../../services';
import { AdminPerkifyRequest, adminPerkifyRequestTransform } from '../../types';
import {
  checkIfAnyEmailsAreClaimed,
  checkValidationResult,
  sanitizeEmails,
  validateAdminDoc,
  validateBusinessDoc,
  validateEmails,
  validateFirebaseIdToken,
} from '../../utils';

export const createEmployeesValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  body('employeeEmails')
    .custom(validateEmails)
    .customSanitizer(sanitizeEmails)
    .custom(checkIfAnyEmailsAreClaimed),
  checkValidationResult,
];

export const createEmployees = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const { employeeEmails } = req.body as CreateEmployeesPayload;
    const businessData = req.businessData as Business;

    try {
      const batch = db.batch();
      for (const email of employeeEmails) {
        const newEmployee = await auth.createUser({
          email,
          disabled: false,
        });

        const employeeRef = db
          .collection('businesses')
          .doc(businessData.businessID)
          .collection('employees')
          .doc(newEmployee.uid);
        batch.set(employeeRef, {
          email,
          employeeID: employeeRef.id,
          businessID: businessData.businessID,
        });
      }

      await batch.commit();

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
