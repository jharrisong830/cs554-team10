import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { APIContextValue } from "./lib/spotify/types";
import { getUserAccessCode } from "./lib/spotify/data";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWrapper = async () => {
            const newState = await getUserAccessCode(
                authorizationCode,
                codeVerifier
            );
            stateSetter(newState);
            navigate("/", { replace: true });
        };

        fetchWrapper();
    }, []);

    return <h1>Loading</h1>;
}
