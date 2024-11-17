/**
 * data functions for spotify api
 */

import { Track, Album, APIContextValue } from "./types";

const SPOTIFY_CLIENT_ID = "afb9fc797fd2485abe86d74540b42c77";
const pkcePossible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.~";

/**
 * builds the URL for the initial spotify authorization
 *
 * redirects to spotify login, which returns authorization code on success
 *
 * @param codeChallenge code challenge to be sent as a query param
 * @returns authorization endpoint used to get user authorization code
 */
export const getAuthorizationURL = (codeChallenge: string): string => {
    const scope = "playlist-read-private user-read-private user-library-read"; // TODO: refine scopes to be minimal
    const userAuthQuery = {
        response_type: "code",
        redirect_uri: "http://localhost:5173/auth/success",
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge
    };

    const authURL =
        "https://accounts.spotify.com/authorize?" + // construct http query
        Object.entries(userAuthQuery)
            .map(([k, v]) => `${k}=${v}`)
            .join("&");

    return authURL;
};

/**
 * generates a cryptographically secure string of given length in [43, 128] according to the PKCE protocol
 *
 * reference for implementation: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 *
 * @param {number} length   length of the randomly generated string
 *
 * @returns {string} randomly generated string according to PKCE standard
 * @throws when length is invalid
 */
const generatePKCEString = (length = 64): string => {
    if (typeof length !== "number")
        throw `invalid length, expected type number, received ${typeof length} (${length})`;
    if (length < 43 || length > 128 || length % 1 !== 0)
        throw `invalid length, expected integer in [43, 128], received ${length}`;

    const randVals = crypto.getRandomValues(new Uint8Array(length)); // fill a byte array of size length with random values
    return randVals.reduce(
        (acc, curr) => acc + pkcePossible[curr % pkcePossible.length],
        ""
    ); // get each character in the string
};

/**
 * encrypt str with sha256 algorithm
 *
 * reference for implementation: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 *
 * @param str message to be encrypted
 * @returns sha256 encrypted message buffer
 */
const encrypt = async (str: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return await crypto.subtle.digest("SHA-256", data); // encrypt with sha256 algo
};

/**
 * base-64 encode a byte buffer
 *
 * reference for implementation: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 *
 * @param input buffer to be encoded
 * @returns base-64 encoded string
 */
const base64encode = (input: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

/**
 * returns a triplet of PKCE codes to use for authorization
 *
 * @param length length of the randomly generated string
 * @returns object containing codeVerifier, hashed, and codeChallenge
 * @throws when length is invalid
 */
export const getPKCECodes = async (length: number = 64) => {
    const codeVerifier = generatePKCEString(length); // will throw with incorrect length
    const hashed = await encrypt(codeVerifier);
    const codeChallenge = base64encode(hashed);

    return {
        codeVerifier: codeVerifier,
        hashed: hashed,
        codeChallenge: codeChallenge
    };
};

export const getUserAccessCode = async (
    authorizationCode: string,
    codeVerifier: string
): Promise<APIContextValue> => {
    const accessBody = new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: "http://localhost:5173/auth/success",
        client_id: SPOTIFY_CLIENT_ID, // for PKCE
        code_verifier: codeVerifier
    });
    const accessHeader = {
        "Content-Type": "application/x-www-form-urlencoded"
    };

    const data = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: accessHeader,
        body: accessBody
    }); // post request, with given body/header data

    const responseBody = await data.json();

    const now = Math.floor(Date.now() / 1000); // add to expires_in, the time that the access token expires at

    const accessToken: string | null = responseBody.access_token;
    const expiresAt: number | null = now + responseBody.expires_in;
    const refreshToken: string | null = responseBody.refresh_token;

    return {
        codeVerifier: codeVerifier,
        accessToken: accessToken,
        expiresAt: expiresAt,
        refreshToken: refreshToken
    };
};

// const getTrack = async (accessToken: string, trackId: string): Track => {
//     const data = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
//         method: "GET",
//         headers: {
//             Authorization: `Bearer ${accessToken}`
//         }
//     });

//     return {
//         _id: data.id, // all info is stored within a "track" subobject in the items array
//         platform: "SP", // hardcoded bc duh...
//         type: "track", // again...
//         isrc: data.external_ids.isrc,
//         name: data.name,
//         artists: data.artists.map((a) => a.name), // extract only the names
//         platformURL: data.external_urls.spotify,
//         albumId: data.album.id
//     };
// };
