import axios from "axios";

const PerkifyApi = axios.create({
  baseURL:
    // 'https://api.discordstudy.com/',
    `${
      process.env.NODE_ENV == "development"
        ? "http://localhost:5001"
        : "https://us-central1-perkify-5790b.cloudfunctions.net"
    }/perkify-5790b/us-central1`,
});

PerkifyApi.defaults.withCredentials = true;

export { PerkifyApi };
