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
    search,
    getArtist2,
    getArtistAlbumsWithImage
} from "./lib/spotify/data";
import { emptyAPIContextValue } from "./lib/spotify/types";
import AuthSuccessPage from "./AuthSuccessPage";
import SpotifyContext from "./contexts/SpotifyContext";
import Homepage from "./homepage/Homepage";
import SearchPage from "./SearchPage";
import ArtistPage from "./ArtistPage";
import Selection from "./Selection";
import RankerPage from "./Ranker/RankerPage";
import TierListPage from "./TierList/TierListPage";

export default function App() {
    const [apiState, setApiState] = useState(emptyAPIContextValue());

    const routeObjects: Array<RouteObject> = [
        {
            path: "/",
            element: (
                <>
                    <Homepage />

                    <br />
                    <hr  className="border-gray-500"/>
                    <br />

                    <h1 className="text-4xl font-bold">Click here to get started!</h1>
                    <br />

                    <nav>
                        <Link to="/search" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Search</Link>
                        {apiState.accessToken === null ? (
                            <Link to="/auth" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Authorize</Link>
                        ) : (
                            <div></div>
                        )}
                    </nav>


                    <br/>

                   
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
                        <div>
                            <h1 className="text-4xl font-bold">Click below to authorize:</h1>
                            <br/>
                            <Link to="/auth" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Authorize</Link>
                        </div>
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

            path: "/artist/:id",
            element: <ArtistPage handleArtist={(token: string, artistId: string) => 
                getArtist2(token, artistId)} handleAlbums={(token:string, artistId: string) => getArtistAlbumsWithImage(token, artistId)}></ArtistPage>
        },
      {
            path: "/ranker",
            element: (
                <>
                        <RankerPage />
                </>
            )
        },
        {
            path: "/tierlist",
            element: (
                <>
                        <TierListPage />
                </>
            )
        },
        {
            path: "/selection/:id",
            element: (
                <>
                    {apiState.accessToken === null ? (
                        <div>
                            <h1 className="text-4xl font-bold">Click below to authorize:</h1>
                            <br/>
                            <Link to="/auth" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Authorize</Link>
                        </div>
                    ) : (<Selection/>)}
                </>
            )
        }
    ];

    const router = createBrowserRouter(routeObjects);
    
    return (
        <>
            <SpotifyContext.Provider
                value={{ stateValue: apiState, stateSetter: setApiState }}
            >
                <RouterProvider router={router} />
            </SpotifyContext.Provider>
        </>
    );
}


// {apiState.accessToken === null ? (
//     <div>
//          <br/>
//          <Link to="/auth" className="navbarButtons">Authorize</Link>
//      </div>
//  ) : (
//      <div>
//          <p>Test track:</p>
//          <p>{JSON.stringify(currTrack)}</p>
//          <img src={currTrackImage ?? ""} />

//          <p>Test album:</p>
//          <p>{JSON.stringify(currAlbum)}</p>
//          <img src={currAlbumImage ?? ""} />

//          <p>Test artist:</p>
//          <p>{JSON.stringify(currArtist)}</p>
//          <img src={currArtistImage ?? ""} />

//          <p>Test artist albums:</p>
//          <p>
//              {JSON.stringify(
//                  artistAlbums?.map((a) => a.name)
//              )}
//          </p>
//      </div>
//  )}