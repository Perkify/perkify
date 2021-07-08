import React, { useContext, useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./Auth";
import app from "./firebaseapp.js";
import firebase from "firebase/app";
import 'firebase/firestore';




const PrivateRoute = ({ component: RouteComponent, ...rest }) => {
    const {currentUser} = useContext(AuthContext);

    var [numGroups, setNumGroups] = useState(0)

    // useEffect(() => {
    //     console.log(currentUser.uid)
    //     var db = firebase.firestore()
    //     db.collection("admins").doc(currentUser.uid).get().then((doc) => {
    //         if (doc.exists) {
    //             console.log("Document data:", doc.data());
    //         } else {
    //             // doc.data() will be undefined in this case
    //             console.log("No such document!");
    //         }
    //     }).catch((error) => {
    //         console.log("Error getting document:", error);
    //     });
        
    //   });
    return (
        <Route
            {...rest}
            render={routeProps =>
                !!currentUser ? (
                    <RouteComponent {...routeProps} />
                ) : (
                    <Redirect to={"/login"} />
                )
            }
        />
    );
};


export default PrivateRoute
