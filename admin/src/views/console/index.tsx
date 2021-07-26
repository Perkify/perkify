import { AuthContext } from 'contexts/Auth';
import app from 'firebaseApp';
import React, { useContext } from 'react';
import { PerkifyApi } from 'services';

const Console = () => {
  const { currentUser } = useContext(AuthContext);

  const addGroup = async () => {
    const bearerToken = await currentUser.getIdToken();
    const response = await PerkifyApi.post(
      '/user/auth/createGroup',
      JSON.stringify({
        group: 'A',
        emails: ['prateek@humane.com', 'prateek.humane@gmail.com'],
        perks: ['Netflix Basic', 'Masterclass'],
      }),
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
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
