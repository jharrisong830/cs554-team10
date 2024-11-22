import { useState, useEffect } from "react";
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
    getTrack,
    getAlbum,
    getAlbumArtwork,
    getArtist,
    getArtistImage,
    getArtistAlbums,
    search
} from "./lib/spotify/data";
import {
    emptyAPIContextValue,
    Track,
    Album,
    Artist
} from "./lib/spotify/types";
import AuthSuccessPage from "./AuthSuccessPage";
import SpotifyContext from "./contexts/SpotifyContext";
import Homepage from "./homepage/Homepage";
import SearchPage from "./SearchPage";

export default function App() {
    const [apiState, setApiState] = useState(emptyAPIContextValue());

    const [currTrack, setCurrTrack] = useState<Track | null>(null);
    const [currAlbum, setCurrAlbum] = useState<Album | null>(null);
    const [currTrackImage, setCurrTrackImage] = useState<string | null>(null);
    const [currAlbumImage, setCurrAlbumImage] = useState<string | null>(null);

    const [currArtist, setCurrArtist] = useState<Artist | null>(null);
    const [currArtistImage, setCurrArtistImage] = useState<string | null>(null);
    const [artistAlbums, setArtistAlbums] = useState<Array<Album> | null>(null);

    useEffect(() => {
        // these funcs are only called when accessToken is not null, we can force the value with !
        const trackWrapper = async () => {
            const newTrack = await getTrack(
                apiState.accessToken!,
                "26QLJMK8G0M06sk7h7Fkse?si=f4e3764ddc3148a0"
            );
            setCurrTrack(newTrack);

            const newTrackImage = await getAlbumArtwork(
                apiState.accessToken!,
                newTrack.albumId
            );
            setCurrTrackImage(newTrackImage);
        };

        const albumWrapper = async () => {
            const newAlbum = await getAlbum(
                apiState.accessToken!,
                "4HTy9WFTYooRjE9giTmzAF?si=efxmZtHvR1W8FKyo5r7_MQ"
            );
            setCurrAlbum(newAlbum);

            const newAlbumImage = await getAlbumArtwork(
                apiState.accessToken!,
                "4HTy9WFTYooRjE9giTmzAF?si=efxmZtHvR1W8FKyo5r7_MQ"
            );
            setCurrAlbumImage(newAlbumImage);
        };

        const artistWrapper = async () => {
            const newArtist = await getArtist(
                apiState.accessToken!,
                "1oPRcJUkloHaRLYx0olBLJ"
            );
            setCurrArtist(newArtist);

            const newArtistImage = await getArtistImage(
                apiState.accessToken!,
                "1oPRcJUkloHaRLYx0olBLJ"
            );
            setCurrArtistImage(newArtistImage);
        };

        const artistAlbumsWrapper = async () => {
            const newAlbums = await getArtistAlbums(
                apiState.accessToken!,
                "1oPRcJUkloHaRLYx0olBLJ"
            );
            setArtistAlbums(newAlbums);
        };

        if (apiState.accessToken !== null) {
            trackWrapper();
            albumWrapper();
            artistWrapper();
            artistAlbumsWrapper();
        }
    }, [apiState]);

    const routeObjects: Array<RouteObject> = [
        {
            path: "/",
            element: (
                <>
                    <Homepage />

                    <p>API values:</p>
                    <p>{JSON.stringify(apiState)}</p>

                    <Link to="/search">Search</Link>

                    {apiState.accessToken === null ? (
                        <Link to="/auth">Authorize</Link>
                    ) : (
                        <div>
                            <p>Test track:</p>
                            <p>{JSON.stringify(currTrack)}</p>
                            <img src={currTrackImage ?? ""} />

                            <p>Test album:</p>
                            <p>{JSON.stringify(currAlbum)}</p>
                            <img src={currAlbumImage ?? ""} />

                            <p>Test artist:</p>
                            <p>{JSON.stringify(currArtist)}</p>
                            <img src={currArtistImage ?? ""} />

                            <p>Test artist albums:</p>
                            <p>
                                {JSON.stringify(
                                    artistAlbums?.map((a) => a.name)
                                )}
                            </p>
                        </div>
                    )}
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
                        <Link to="/auth">Authorize</Link>
                    ) : (
                        <SearchPage
                            handleSearch={(searched: string, type: string) =>
                                search(apiState.accessToken!, searched, type)
                            }
                        ></SearchPage>
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
