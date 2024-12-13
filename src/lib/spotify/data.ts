/**
 * data functions for spotify api
 */

import { APIContextValue, Track, Album, Artist } from "./types";

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
    const scope = "playlist-read-private playlist-modify-private playlist-modify-public"; // TODO: refine scopes to be minimal
    const userAuthQuery = {
        response_type: "code",
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URL,
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
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

/**
 * returns a new state value containing api keys for accessing the spotify api
 *
 * @param authorizationCode code received from previous step
 * @param codeVerifier codeVerifier generated from the start of the authorization flow
 * @returns object containing all api keys and relevant info
 */
export const getUserAccessCode = async (
    authorizationCode: string,
    codeVerifier: string
): Promise<APIContextValue> => {
    const accessBody = new URLSearchParams({
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID, // for PKCE
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URL,
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

/**
 * returns track data from the spotify api
 *
 * @param accessToken needed to access spotify api
 * @param trackId id of the track to be fetched
 * @returns Track object
 */
export const getTrack = async (
    accessToken: string,
    trackId: string
): Promise<Track> => {
    const data = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const responseBody = await data.json();

    return {
        type: "track",
        spotifyId: responseBody.id,
        isrc: responseBody.external_ids.isrc,
        name: responseBody.name,
        artists: responseBody.artists.map((artist: any) => ({
            name: artist.name,
            spotifyId: artist.id
        })),
        platformURL: responseBody.external_urls.spotify,
        albumId: responseBody.album.id,
        selected: true
    };
};

/**
 * returns album data from the spotify api
 *
 * @param accessToken needed to access spotify api
 * @param albumId id of the album to be fetched
 * @returns Album object
 */
export const getAlbum = async (
    accessToken: string,
    albumId: string
): Promise<Album> => {
    const data = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const responseBody = await data.json();

    return {
        type: "album",
        albumType: responseBody.album_type,
        spotifyId: responseBody.id,
        name: responseBody.name,
        artists: responseBody.artists.map((artist: any) => ({
            name: artist.name,
            spotifyId: artist.id
        })),
        images: responseBody.images,
        platformURL: responseBody.external_urls.spotify,
        selected: true,
        tracks: []
    };
};

export const getAlbumTracks = async (
    accessToken: string,
    albumId: string
): Promise<Array<{ type: "track", name: string, spotifyId: string, selected: boolean }>> => {
    let nextPage = `https://api.spotify.com/v1/albums/${albumId}/tracks`; // setting the initial url as the first page
    let allTracks: Array<{ type: "track", name: string, spotifyId: string, selected: boolean }> = [];

    do {
        const data = await fetch(nextPage, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const responseBody = await data.json();
        console.log(responseBody);
        allTracks.push(
            ...responseBody.items // ... to unpack the array into varargs
                .map((track: any) => ({
                    type: "track",
                    spotifyId: track.id,
                    //isrc: track.external_ids.isrc,
                    name: track.name,
                    selected: true
                }))
        );

        nextPage = responseBody.next; // get the next page url
    } while (nextPage); // continue while next page is not null

    return allTracks;
};

/**
 * returns a temporary url, used to display artwork for a particular album
 *
 * @param accessToken needed to access spotify api
 * @param albumId id of album for which we want to fetch artwork
 * @returns image url as string
 */
export const getAlbumArtwork = async (
    accessToken: string,
    albumId: string
): Promise<string> => {
    const data = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const responseBody = await data.json();

    return Object.keys(responseBody).includes("images") &&
        responseBody.images.length > 0
        ? responseBody.images[0].url
        : null;
};

/**
 * returns an array of tracks associated with a particular album
 *
 * @param accessToken needed to access spotify api
 * @param albumId id of album for which we want to fetch tracks
 * @returns array of tracks
 */
export const search = async (
    accessToken: string,
    searchTerm: string,
    type: string,
    page: number
): Promise<string> => {
    let data:any = [];
    if (page) {
        data = await fetch(
            `https://api.spotify.com/v1/search?offset=${(page-1) * 20}&q=${searchTerm}&type=${type}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
    } else {
        data = await fetch(
            `https://api.spotify.com/v1/search?q=${searchTerm}&type=${type}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
    }
    const responseBody = await data.json();
    return responseBody;
};

/**
 * returns artist data from the spotify api
 *
 * @param accessToken needed to access spotify api
 * @param artistId id of the artist to be fetched
 * @returns Artist object
 */
export const getArtist = async (
    accessToken: string,
    artistId: string
): Promise<Artist> => {
    console.log(accessToken);
    const data = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const responseBody = await data.json();

    return {
        type: "artist",
        spotifyId: responseBody.id,
        name: responseBody.name,
        platformURL: responseBody.external_urls.spotify,
    };
};


export const getArtist2 = async (
    accessToken: string,
    artistId: string
): Promise<Artist> => {
    console.log("response");
    const data = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const responseBody = await data.json();
    console.log(responseBody);
    return responseBody;
};
/**
 * returns a temporary url, used to display an image for an artist
 *
 * @param accessToken needed to access spotify api
 * @param artistId id of artist for which we want to fetch image
 * @returns image url as string
 */
export const getArtistImage = async (
    accessToken: string,
    artistId: string
): Promise<string> => {
    const data = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const responseBody = await data.json();

    return Object.keys(responseBody).includes("images") &&
        responseBody.images.length > 0
        ? responseBody.images[0].url
        : null;
};

/**
 * returns an array of albums associated with a particular artist
 *
 * @param accessToken needed to access spotify api
 * @param artistId id of artist for which we want to fetch albums
 * @returns array of albums
 */
export const getArtistAlbums = async (
    accessToken: string,
    artistId: string
): Promise<Array<Album>> => {
    let nextPage = `https://api.spotify.com/v1/artists/${artistId}/albums`; // setting the initial url as the first page
    let allAlbums: Array<Album> = [];

    do {
        const data = await fetch(nextPage, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const responseBody = await data.json();
        allAlbums.push(
            ...responseBody.items // ... to unpack the array into varargs
                .map((album: any) => ({
                    type: "album",
                    albumType: album.album_group,
                    spotifyId: album.id,
                    name: album.name,
                    images: album.images,
                    artists: album.artists.map((a: any) => a.name),
                    platformURL: album.external_urls.spotify,
                    selected: true
                }))
        );

        nextPage = responseBody.next; // get the next page url
    } while (nextPage); // continue while next page is not null
    return allAlbums;
};

export const getArtistAlbumsWithImage = async (
    accessToken: string,
    artistId: string
): Promise<Array<Album>> => {
    let nextPage = `https://api.spotify.com/v1/artists/${artistId}/albums`; // setting the initial url as the first page
    let allAlbums: Array<Album> = [];


        const data = await fetch(nextPage, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const responseBody = await data.json();
        allAlbums.push(
            ...responseBody.items // ... to unpack the array into varargs
                .map((album: any) => ({
                    type: "album",
                    albumType: album.album_type,
                    spotifyId: album.id,
                    name: album.name,
                    artists: album.artists.map((a: any) => a.name),
                    platformURL: album.external_urls.spotify,
                    image: (album.images && album.images[0] && album.images[0].url) ? album.images[0].url : "Not found"
                }))
        );

    return allAlbums;
};

export const fetchTracksForAlbums = async (
    accessToken: string,
    albums: Album[]
): Promise<Album[]> => {
    const chunkSize = 20;
    let albumsWithTracks: Album[] = [];

    for (let i = 0; i < albums.length; i += chunkSize) {
        const chunk = albums.slice(i, i + chunkSize); // Take a chunk of albums
        const idsParam = chunk.map((album) => album.spotifyId).join(","); // Comma-separated IDs
        const url = `https://api.spotify.com/v1/albums?ids=${idsParam}`;

        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            throw new Error(`Error fetching albums: ${response.statusText}`);
        }

        const data = await response.json();

        const chunkWithTracks = data.albums.map((album: any) => {
            const originalAlbum = chunk.find((a) => a.spotifyId === album.id); // Match original album

            return {
                ...originalAlbum, // Preserve original metadata
                tracks: album.tracks.items.map((track: any): Track => ({
                    type: "track",
                    spotifyId: track.id,
                    name: track.name,
                    selected: true,
                    isrc: track.external_ids?.isrc || null, // Fetch ISRC if available
                    artists: track.artists.map((artist: any) => artist.name), // Extract artist names
                    platformURL: track.external_urls.spotify, // Spotify URL for the track
                    albumId: album.id, // Add album ID for reference
                })),
            } as Album;
        });

        albumsWithTracks = albumsWithTracks.concat(chunkWithTracks);
    }

    return albumsWithTracks;
};

