import axios from 'axios';

const PerkifyApi = axios.create({
  baseURL:
    process.env.NODE_ENV == 'development'
      ? 'http://localhost:5001/perkify-5790b/us-central1'
      : 'https://us-central1-perkify-5790b.cloudfunctions.net',
});

PerkifyApi.defaults.withCredentials = true;

export { PerkifyApi };
