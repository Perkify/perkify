import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

const prodFirebaseConfig = {
  apiKey: 'AIzaSyA8MFTaagEWsF3-9tUL1GvZq3OGeA4XL5k',
  authDomain: 'perkify-prod.firebaseapp.com',
  projectId: 'perkify-prod',
  storageBucket: 'perkify-prod.appspot.com',
  messagingSenderId: '729019735857',
  appId: '1:729019735857:web:389e4ad51ab9d51fd45a10',
  measurementId: 'G-XG60T5JEF1',
};

const devFirebaseConfig = {
  apiKey: 'AIzaSyDy0YjntwrgEwpDVGbqHtJfUtl3fu-9so4',
  authDomain: 'perkify-5790b.firebaseapp.com',
  projectId: 'perkify-5790b',
  storageBucket: 'perkify-5790b.appspot.com',
  messagingSenderId: '70680365143',
  appId: '1:70680365143:web:b833a744f5880b96cd3b12',
  measurementId: 'G-CJNSWW5F87',
};

const app = firebase.initializeApp(
  process.env.REACT_APP_FIREBASE_ENVIRONMENT == 'production'
    ? prodFirebaseConfig
    : devFirebaseConfig
);

const db = app.firestore();
const auth = app.auth();
const functions = app.functions();

const environment = process.env.REACT_APP_FIREBASE_ENVIRONMENT;

if (process.env.REACT_APP_FIREBASE_MODE == 'emulator') {
  console.info('Using emulator firestore');
  auth.useEmulator('http://localhost:9099');
  db.useEmulator('localhost', 8080);
  functions.useEmulator('localhost', 5001);
}

// export default app;
export { app, db, auth, functions, environment };
