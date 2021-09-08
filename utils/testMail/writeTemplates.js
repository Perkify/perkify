var admin = require('firebase-admin');
var fs = require('fs');

admin.initializeApp({projectId: 'perkify-5790b'});

var adminEmailConfirmationHTML = fs.readFileSync("./adminEmailConfirmation.html").toString('utf-8');
var adminPasswordResetHTML = fs.readFileSync("./adminPasswordReset.html").toString('utf-8');
var userOnboardingHTML = fs.readFileSync("./userOnboarding.html").toString('utf-8');
var userSignInLinkHTML = fs.readFileSync("./userSignInLink.html").toString('utf-8');

templates = {
'adminEmailConfirmation':{
	subject: "Perkify Email Confirmation",
	html: adminEmailConfirmationHTML,
},
'adminPasswordReset':{
	subject: "Reset your Password",
	html: adminPasswordResetHTML ,
},
'userOnboarding':{
	subject: "Welcome to Perkify",
	html: userOnboardingHTML ,
},
'userSignInLink':{
	subject: "Sign in to Perkify",
	html: userSignInLinkHTML,
},
}

for (const templateName in templates){
	admin
	  .firestore()
	  .collection("emailTemplates")
	  .doc(templateName)
	  .set(templates[templateName])
	  .then(() => console.log("template added"));
}
