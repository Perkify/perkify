import React, { useContext, useEffect } from "react";
import app from "firebaseApp";
import { AuthContext } from "@contexts/Auth";

const Console = () => {
  const { currentUser } = useContext(AuthContext);

  const addGroup = async () => {
    const bearerToken = await currentUser.getIdToken();
    console.log(bearerToken);
    const response = await fetch(
      "http://localhost:5001/perkify-5790b/us-central1/user/auth/createGroup",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group: "A",
          emails: ["prateek@humane.com", "prateek.humane@gmail.com"],
          perks: ["Netflix Basic", "Masterclass"],
        }),
      }
    );
  };

  return (
    <>
      <h1>Welcome {currentUser.email}</h1>
      <button onClick={addGroup}>add group</button>
      <button onClick={() => app.auth().signOut()}>Sign out</button>
    </>
  );
};

export default Console;
