/**
 * type defs for objects returned from spotify api
 */

export type Track = {
    type: "track";
    spotifyId: string;
    isrc: string;
    name: string;
    artists: Array<{ name: string; spotifyId: string }>;
    platformURL: string;
    albumId: string;
    selected: boolean;
};

export type SongData = {
    platformURLAlbum: string;
    albumName: string;
    name: string;
    spotifyId: string;
    selected: boolean;
    id: string;
    images: { url: string; height: number; width: number; }[]
};

export type SongDataArray = SongData[];

export type TierItemProps = {
    id: string;
    imageUrl?: string;
    altText: string;
}

export type TierBaseProps = {
    items: TierItemProps[];
}

export type TierBoardProps = {
    initialRows: { rowId: string; items: TierItemProps[]; color: string; letter: string }[];
    baseItems: TierItemProps[];
    title: string;
}

export type TierRowProps = {
    rowId: string;
    items: TierItemProps[];
    color: string;
    letter: string;
}

export type TierProps = {
    initialLetter: string;
    initialColor: string;
  }

export type CurrSortType = {
    battleNumber: number;
    progress: number;
    leftIndex: number;
    leftInnerIndex: number;
    rightIndex: number;
    rightInnerIndex: number;
    choices: string;
    sortedIndexList: number[][];
    recordDataList: number[];
    parentIndexList: number[];
    tiedDataList: number[];
    pointer: number;
    sortedNumber: number;
    history: any[]
    totalBattles: number;
};

export type Album = {
    type: "album";
    albumType: "album" | "single" | "compilation" | "appears_on";
    spotifyId: string;
    name: string;
    artists: Array<{ name: string; spotifyId: string }>;
    platformURL: string;
    selected: boolean;
    images: { url: string; height: number; width: number; }[]
    tracks: Array<{name: string; spotifyId: string; selected: boolean}>;
};

export type Artist = {
    type: "artist";
    spotifyId: string;
    name: string;
    platformURL: string;
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
