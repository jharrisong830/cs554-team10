import { useEffect, useContext } from "react";
import { useLoaderData } from "react-router-dom";
import { APIContextValue } from "./lib/spotify/types";
import { getUserAccessCode } from "./lib/spotify/data";
import SpotifyContext from "./contexts/SpotifyContext";
import { useNavigate } from "react-router-dom";

export default function AuthSuccessPage() {
    const queryParams = useLoaderData() as URLSearchParams;
    const codeVerifier = queryParams.get("codeVerifier")!;
    const authorizationCode = queryParams.get("code")!;
    const navigate = useNavigate();

    const { stateSetter } = useContext(SpotifyContext)!;

    useEffect(() => {
        const fetchWrapper = async () => {
            const newState: APIContextValue = await getUserAccessCode(
                authorizationCode,
                codeVerifier
            );
            stateSetter(newState);
            navigate("/", { replace: true });
        };

        fetchWrapper();
    }, []);

    return (
        <div>
            <h1>Loading...</h1>
            <p>We're connecting to Spotify, hold tight!</p>
        </div>
    );
}
