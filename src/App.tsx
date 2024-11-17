import { useState } from "react";
import {
    createBrowserRouter,
    redirect,
    RouteObject,
    RouterProvider
} from "react-router-dom";
import "./App.css";
import { getAuthorizationURL, getPKCECodes } from "./lib/spotify/data";
import { emptyAPIContextValue } from "./lib/spotify/types";
import TestDisplayAuthSuccess from "./TestDisplayAuthSuccess";

export default function App() {
    const [apiState, setApiState] = useState(emptyAPIContextValue());

    const routeObjects: Array<RouteObject> = [
        {
            path: "/",
            element: (
                <>
                    <h1>Welcome!</h1>
                    <a href="/auth">Authorize</a>
                </>
            )
        },
        {
            path: "/auth",
            loader: async () => {
                const { codeVerifier, codeChallenge } = await getPKCECodes();
                localStorage.setItem("codeVerifier", codeVerifier); // set verifier in localStorage

                const url = getAuthorizationURL(codeChallenge);
                return redirect(url);
            }
        },
        {
            path: "/auth/success",
            element: (
                <TestDisplayAuthSuccess
                    stateValue={apiState}
                    stateSetter={setApiState}
                />
            ),
            loader: async ({ request }) => {
                const urlObj = new URL(request.url);
                const codeVerifier = localStorage.getItem("codeVerifier");
                if (codeVerifier === null) return redirect("/"); // go home if no code
                urlObj.searchParams.append("codeVerifier", codeVerifier);
                return urlObj.searchParams; // return the querystring params, so they can be accessed
            }
        }
    ];

    const router = createBrowserRouter(routeObjects);

    return <RouterProvider router={router} />;
}
