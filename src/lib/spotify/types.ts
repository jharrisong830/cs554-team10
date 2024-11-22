/**
 * type defs for objects returned from spotify api
 */

export type Track = {
    type: "track";
    spotifyId: string;
    isrc: string;
    name: string;
    artists: Array<{ name: string, spotifyId: string }>;
    platformURL: string;
    albumId: string;
};

export type Album = {
    type: "album";
    albumType: "album" | "single" | "compilation" | "appears_on";
    spotifyId: string;
    name: string;
    artists: Array<{ name: string, spotifyId: string }>;
    platformURL: string;
};

export type Artist = {
    type: "artist",
    spotifyId: string;
    name: string;
    platformURL: string
};

export type APIContextValue = {
    codeVerifier: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
};

export type APIContextProps = {
    stateValue: APIContextValue;
    stateSetter: React.Dispatch<React.SetStateAction<APIContextValue>>;
};

export const emptyAPIContextValue = (): APIContextValue => ({
    codeVerifier: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null
});
