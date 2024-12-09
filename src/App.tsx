import { useState } from "react";
import {
    createBrowserRouter,
    redirect,
    RouteObject,
    RouterProvider,
    Link
} from "react-router-dom";
import "./App.css";
import {
    getAuthorizationURL,
    getPKCECodes,
    search
} from "./lib/spotify/data";
import { emptyAPIContextValue } from "./lib/spotify/types";
import AuthSuccessPage from "./AuthSuccessPage";
import SpotifyContext from "./contexts/SpotifyContext";
import Homepage from "./Homepage";
import SearchPage from "./SearchPage";

export default function App() {
    const [apiState, setApiState] = useState(emptyAPIContextValue());

    const routeObjects: Array<RouteObject> = [
        {
            path: "/",
            element: <Homepage />
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
            element: <AuthSuccessPage />,
            loader: async ({ request }) => {
                const urlObj = new URL(request.url);
                const codeVerifier = localStorage.getItem("codeVerifier");
                if (codeVerifier === null) return redirect("/"); // go home if no code
                urlObj.searchParams.append("codeVerifier", codeVerifier);
                return urlObj.searchParams; // return the querystring params, so they can be accessed
            }
        },
        {
            path: "/search",
            element: (
                <>
                    {apiState.accessToken === null ? (
                        <Link to="/auth">Authorize</Link>
                    ) : (
                        <SearchPage
                            handleSearch={(searched: string, type: string, page?:number) =>
                                search(apiState.accessToken!, searched, type, (page ? page: 1))
                            }
                        ></SearchPage>
                    )}
                </>
            )
        },
        {
            path: "/ranker",
            element: (
                <>
                    {apiState.accessToken === null ? (
                        <Link to="/auth">Authorize</Link>
                    ) : (
                        <h1>Ranker page here</h1>
                    )}
                </>
            )
        },
        {
            path: "/tierlist",
            element: (
                <>
                    {apiState.accessToken === null ? (
                        <Link to="/auth">Authorize</Link>
                    ) : (
                        <h1>Tier list page here</h1>
                    )}
                </>
            )
        }
    ];

    const router = createBrowserRouter(routeObjects);

    return (
        <SpotifyContext.Provider
            value={{ stateValue: apiState, stateSetter: setApiState }}
        >
            <RouterProvider router={router} />
        </SpotifyContext.Provider>
    );
}
