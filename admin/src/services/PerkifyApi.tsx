import axios from 'axios';

const PerkifyApi = axios.create({
  baseURL:
    process.env.REACT_APP_FIREBASE_ENVIRONMENT == 'production'
      ? 'https://us-central1-perkify-prod.cloudfunctions.net'
      : process.env.REACT_APP_FIREBASE_ENVIRONMENT == 'staging'
      ? 'https://us-central1-perkify-5790b.cloudfunctions.net'
      : 'http://localhost:5001/perkify-5790b/us-central1',
});

PerkifyApi.defaults.withCredentials = true;

export { PerkifyApi };
