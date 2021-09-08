import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import admin, { db, stripe } from '../../services';
import {
  adminPerkifyRequestTransform,
  checkEmployeesExistInBusiness,
  checkValidationResult,
  validateAdminDoc,
  validateBusinessDoc,
  validateFirebaseIdToken,
} from '../../utils';

export const deleteEmployeesValidators = [
  validateFirebaseIdToken,
  validateAdminDoc,
  validateBusinessDoc,
  body('employeeIDs').custom(checkEmployeesExistInBusiness),
  checkValidationResult,
];

export const deleteEmployees = adminPerkifyRequestTransform(
  async (req: AdminPerkifyRequest, res: Response, next: NextFunction) => {
    const { employeeIDs } = req.body as DeleteEmployeesPayload;
    const businessID = req.businessID;

    try {
      const batch = db.batch();
      for (const employeeID of employeeIDs) {
        const employeeRef = db
          .collection('businesses')
          .doc(businessID)
          .collection('employees')
          .doc(employeeID);
        const employeeData = (await employeeRef.get()).data() as Employee;
        if (employeeData?.card?.id) {
          await stripe.issuing.cards.update(employeeData.card.id, {
            status: 'canceled',
          });
        }
        if (employeeData?.perkGroupID) {
          await db
            .collection('businesses')
            .doc(businessID)
            .update({
              [`perkGroups.${employeeData?.perkGroupID}.employeeIDs`]:
                admin.firestore.FieldValue.arrayRemove(employeeID),
            });
        }
        batch.delete(employeeRef);
      }

      await batch.commit();

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
