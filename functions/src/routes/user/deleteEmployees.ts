import { NextFunction, Response } from 'express';
import { body } from 'express-validator';
import admin, { db } from '../../services';
import {
  adminPerkifyRequestTransform,
  checkEmployeesExistInBusiness,
  checkValidationResult,
  updateStripeSubscription,
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

    // overview
    // first remove employees from the business document
    // then update the stripe subscription
    // then delete the user documents

    try {
      let perkGroupsChanged = false;
      const batch = db.batch();
      for (const employeeID of employeeIDs) {
        const employeeRef = db
          .collection('businesses')
          .doc(businessID)
          .collection('employees')
          .doc(employeeID);
        const employeeData = (await employeeRef.get()).data() as Employee;
        if (employeeData?.perkGroupID) {
          perkGroupsChanged = true;
          await db
            .collection('businesses')
            .doc(businessID)
            .update({
              [`perkGroups.${employeeData?.perkGroupID}.employeeIDs`]: admin.firestore.FieldValue.arrayRemove(
                employeeID
              ),
            });
        }
      }

      // remove employees from the business document
      await batch.commit();

      // this will update the stripe subscription and delete the employee cards
      if (perkGroupsChanged) {
        await updateStripeSubscription(req.businessData, next);
      }

      // delete the employee documents
      const employeeDeleteBatch = db.batch();
      for (const employeeID of employeeIDs) {
        const employeeRef = db
          .collection('businesses')
          .doc(businessID)
          .collection('employees')
          .doc(employeeID);
        employeeDeleteBatch.delete(employeeRef);

        await admin.auth().deleteUser(employeeID);
      }
      await employeeDeleteBatch.commit();

      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);
