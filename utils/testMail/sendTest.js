var admin = require('firebase-admin');

admin.initializeApp({projectId: 'perkify-prod'});

admin
  .firestore()
  .collection("mail")
  .add({
    to: "prateek.humane@gmail.com",
    message: {
      subject: "Hello from Firebase!",
      text: "This is the plaintext section of the email body.",
    },
  })
  .then(() => console.log("Queued email for delivery!"));
