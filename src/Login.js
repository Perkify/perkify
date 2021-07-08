import React, { useCallback, useContext } from "react";
import { withRouter, Redirect } from "react-router";
import app from "./firebaseapp.js";
import { AuthContext } from "./Auth.js";

const Login = ({ history }) => {
    const handleLogin = useCallback(
        async event => {
            event.preventDefault();
            const { email, password } = event.target.elements;
            try {
                await app
                    .auth()
                    .signInWithEmailAndPassword(email.value, password.value);
                if(currentUser && currentUser.emailVerified===false) {
                    alert("please!! verify your email");
                    app.auth().signOut();
                }
                else {
                    history.push("/console");
                }
            } catch (error) {
                alert(error);
            }
        },
        [history]
    );

    const { currentUser } = useContext(AuthContext);

    if (currentUser) {
        if (currentUser.emailVerified===false){
            alert("please!! verify your email");
            app.auth().signOut();
        }
        else
            return <Redirect to="/console" />;
    }

    return (
        <div>
            <h1>Log in</h1>
            <form onSubmit={handleLogin}>
                <label>
                    Email
                    <input name="email" type="email" placeholder="Email" />
                </label>
                <label>
                    Password
                    <input name="password" type="password" placeholder="Password" />
                </label>
                <button type="submit">Log in</button>
            </form>
        </div>
    );
};

export default withRouter(Login);
