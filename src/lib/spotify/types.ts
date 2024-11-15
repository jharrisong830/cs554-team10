/**
 * type defs for objects returned from spotify api
 */

export type Track = {
    type: "track";
    spotifyId: string;
    isrc: string;
    name: string;
    artists: Array<string>;
    platformURL: string;
    albumId: string;
};

export type Album = {
    type: "album";
    spotifyId: string;
    name: string;
    artists: Array<string>;
    platformURL: string;
};
