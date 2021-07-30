import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyDy0YjntwrgEwpDVGbqHtJfUtl3fu-9so4',
  authDomain: 'perkify-5790b.firebaseapp.com',
  projectId: 'perkify-5790b',
  storageBucket: 'perkify-5790b.appspot.com',
  messagingSenderId: '70680365143',
  appId: '1:70680365143:web:b833a744f5880b96cd3b12',
  measurementId: 'G-CJNSWW5F87',
};

const app = firebase.initializeApp(firebaseConfig);

const db = app.firestore();
const auth = app.auth();
const functions = app.functions();

if (process.env.REACT_APP_FIRESTORE_MODE == 'emulator') {
  console.info('Using emulator firestore');
  db.useEmulator('localhost', 8080);
}

export default app;
export { db, auth, functions };
