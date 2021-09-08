var admin = require('firebase-admin');

admin.initializeApp({projectId: 'perkify-5790b'});

admin
  .firestore()
  .collection("mail")
  .add({
    to: "prateek.humane@gmail.com",
	template: {
		name: "userSignInLink",
		data: {
			signInLink: 'google.com',
		}
	}
  })
  .then(() => console.log("Queued email for delivery!"));
