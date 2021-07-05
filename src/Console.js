import React, { useContext } from "react";
import app from "./firebaseapp.js";
import {AuthContext} from "./Auth";

const Console = () => {
    const {currentUser} = useContext(AuthContext);
    return (
        <>
            <h1>Welcome {currentUser.email}</h1>
            <button onClick={() => app.auth().signOut()}>Sign out</button>
        </>
    );
};

export default Console;
