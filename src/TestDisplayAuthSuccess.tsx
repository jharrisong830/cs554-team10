import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { APIContextValue } from "./lib/spotify/types";
import { getUserAccessCode } from "./lib/spotify/data";

export default function TestDisplayAuthSuccess({
    stateValue,
    stateSetter
}: {
    stateValue: APIContextValue;
    stateSetter: React.Dispatch<React.SetStateAction<APIContextValue>>;
}) {
    const queryParams = useLoaderData() as URLSearchParams;
    const codeVerifier = queryParams.get("codeVerifier")!;
    const authorizationCode = queryParams.get("code")!;

    useEffect(() => {
        const fetchWrapper = async () => {
            const newState = await getUserAccessCode(
                authorizationCode,
                codeVerifier
            );
            stateSetter(newState);
        };

        fetchWrapper();
    }, []);

    return (
        <>
            <h1>Keys after auth stage:</h1>
            <p>{JSON.stringify(stateValue)}</p>
        </>
    );
}
