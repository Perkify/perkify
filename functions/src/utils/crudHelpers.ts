import admin, { db, stripe } from '../models';

export const createUserHelper = async (email, businessID, group, perks) => {
  const docRef = db.collection('users').doc(email);

  await docRef.set({
    businessID,
    group,
    perks: perks.reduce((map, perk) => ((map[perk] = []), map), {}),
  });

  const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
    url: 'http://localhost:3000/dashboard', // I don't think you're supposed to do it this way. Maybe less secure
  });

  // send email
  await db.collection('mail').add({
    to: email,
    message: {
      subject: 'Your employer has signed you up for Perkify!',
      text: `
        Your employer purchased these Perks for you:\n
        ${perks} 
        
        Use this link to sign into your account and redeem your Perks: ${signInLink}.\n 
        `,
    },
  });
};

export const deleteUserHelper = async (userDoc) => {
  await stripe.issuing.cards.update(userDoc.data().card.id, {
    status: 'canceled',
  });
  await db.collection('users').doc(userDoc.id).delete();
};
