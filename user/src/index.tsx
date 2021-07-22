import CssBaseline from "@material-ui/core/CssBaseline";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import ReactDOM from "react-dom";
import "typeface-roboto";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const theme = createTheme({
    palette: {
        primary: {
            main: "#185cff",
        },
        background: {
            // default: "#F4F5F7",
            default: "#FFFFFF",
        },
    },

    shape: {
        borderRadius: 20,
    },
    typography: {
        fontFamily: `"Public Sans", "Roboto", "Helvetica", "Arial", sans-serif`,
        // fontSize: 14,
        // fontWeightLight: 300,
        // fontWeightRegular: 400,
        // fontWeightMedium: 500,
    },
});

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
