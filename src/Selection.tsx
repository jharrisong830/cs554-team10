import { useState, useEffect, useContext, useRef } from "react";
import {
    getArtist,
    getArtistImage,
    getArtistAlbums,
    getAlbumTracks
} from "./lib/spotify/data";
import { Album, Artist, Track } from "./lib/spotify/types";
import SpotifyContext from "./contexts/SpotifyContext";

export default function Selection() {
    const { stateValue } = useContext(SpotifyContext)!;

    const [currArtist, setCurrArtist] = useState<Artist | null>(null);
    const [currArtistImage, setCurrArtistImage] = useState<string | null>(null);
    const [selectedAlbums, setSelectedAlbums] = useState<Array<Album> | null>(null);
    const [finalAlbums, setFinalAlbums] = useState<Array<Album> | null>(null);
    const [trackDropdowns, setTrackDropdowns] = useState<{ [key: string]: boolean }>({});
    const hasFetchedData = useRef(false);
    const [allAlbums, setAllAlbums] = useState(true);
    const [allSingles, setAllSingles] = useState(true);
    const [allAppears, setAllAppears] = useState(true);
    useEffect(() => {
        const fetchTracksForAlbum = async (album: Album): Promise<Album> => {
            const trackList = await getAlbumTracks(stateValue.accessToken!, album.spotifyId);
            return { ...album, tracks: trackList };
        };

        const fetchAllData = async () => {
            if (hasFetchedData.current || !stateValue.accessToken) return;

            try {
                const [artist, artistImage, albums] = await Promise.all([
                    getArtist(stateValue.accessToken, "4kqFrZkeqDfOIEqTWqbOOV"),
                    getArtistImage(stateValue.accessToken, "4kqFrZkeqDfOIEqTWqbOOV"),
                    getArtistAlbums(stateValue.accessToken, "4kqFrZkeqDfOIEqTWqbOOV"),
                ]);

                const albumsWithTracks = await Promise.all(albums.map(fetchTracksForAlbum));

                setCurrArtist(artist);
                setCurrArtistImage(artistImage);
                setSelectedAlbums(albumsWithTracks.map((album) => ({ ...album, selected: true })));
                hasFetchedData.current = true;
            } catch (error) {
                console.error("Error fetching Spotify data:", error);
            }
        };

        fetchAllData();
    }, [stateValue.accessToken]);

    const toggleTrackDropdown = (albumId: string) => {
        setTrackDropdowns((prev) => ({
            ...prev,
            [albumId]: !prev[albumId],
        }));
    };

    const toggleTrackSelection = (albumId: string, trackId: string) => {
        const updatedAlbums = selectedAlbums?.map((album) =>
            album.spotifyId === albumId
                ? {
                    ...album,
                    tracks: album.tracks.map((track) =>
                        track.spotifyId === trackId ? { ...track, selected: !track.selected } : track
                    ),
                }
                : album
        );
        setSelectedAlbums(updatedAlbums);
    };

    const toggleAllTracks = (albumId: string, selectAll: boolean) => {
        const updatedAlbums = selectedAlbums?.map((album) =>
            album.spotifyId === albumId
                ? {
                    ...album,
                    selected: selectAll,
                    tracks: album.tracks.map((track) => ({ ...track, selected: selectAll })),
                }
                : album
        );
        setSelectedAlbums(updatedAlbums);
    };

    const renderTracks = (tracks: Array<Track>, albumId: string) => {
        return tracks.map((track) => (
            <div key={track.spotifyId} style={{ marginLeft: "20px", marginBottom: "5px" }}>
                <button
                    onClick={() => toggleTrackSelection(albumId, track.spotifyId)}
                    style={{
                        padding: "8px 15px",
                        fontSize: "14px",
                        backgroundColor: track.selected ? "#4CAF50" : "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                    }}
                >
                    {track.name}
                </button>
            </div>
        ));
    };

    const renderAlbumsByType = (albums: Array<Album> | null, type: string) => {
        return albums?.filter((album) => album.albumType === type).map((album) => (
            <div key={album.spotifyId} style={{ marginBottom: "15px" }}>
                {album.tracks.length > 1 && (
                    <button
                        onClick={() => toggleTrackDropdown(album.spotifyId)}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: album.selected ? "#4CAF50" : "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer",
                            marginBottom: "10px",
                        }}
                    >
                        {album.name} ↓
                    </button>
                )}
                {album.tracks.length === 1 && (
                    <button
                        onClick={() => toggleAlbumSelection(album.spotifyId)}
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: album.selected ? "#4CAF50" : "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer",
                            marginBottom: "10px",
                        }}
                    >
                        {album.name}
                    </button>
                )}
                {trackDropdowns[album.spotifyId] && album.tracks.length > 1 && (
                    <div style={{ paddingLeft: "10px" }}>
                        <button
                            onClick={() => toggleAllTracks(album.spotifyId, true)}
                        >
                            Select All Tracks
                        </button>
                        <button
                            onClick={() => toggleAllTracks(album.spotifyId, false)}
                        >
                            Deselect All Tracks
                        </button>
                        {renderTracks(album.tracks, album.spotifyId)}
                    </div>
                )}
            </div>
        ));
    };
    
    const toggleAlbumSelection = (albumId: string) => {
        const updatedAlbums = selectedAlbums?.map((album) =>
            album.spotifyId === albumId
                ? { ...album, selected: !album.selected }
                : album
        );
        setSelectedAlbums(updatedAlbums);
    };
    

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
    
        const finAlbums = selectedAlbums?.map((album) => {
            const selectedTracks = album.tracks.filter((track) => track.selected);
            return { ...album, tracks: selectedTracks };
        }).filter((album) => album.tracks.length > 0);
        setFinalAlbums(finAlbums ?? []);
        console.log(finAlbums);
    };
    
    const setAllDropdown = (type: string) => {
        let bool: boolean;
        if (type === "album") {
            bool = !allAlbums;
            setAllAlbums(!allAlbums);
        } else if (type === "single") {
            bool = !allSingles;
            setAllSingles(!allSingles);
        } else {
            bool = !allAppears;
            setAllAppears(!allAppears);
        }
        const updatedAlbums = selectedAlbums?.map((album) =>
            album.albumType === type ? { ...album, selected: bool, tracks: album.tracks.map((track) => ({ ...track, selected: bool })) } : album
        );
        setSelectedAlbums(updatedAlbums);
    };
    //console.log(selectedAlbums)
    return (
        <div>
            <h1>{currArtist?.name ?? "Loading..."}</h1>
            <img src={currArtistImage ?? ""} alt="Artist" />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "20px 0" }}>
                {["album", "single", "appears_on"].map((type) => (
                    <div key={type} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <button onClick={() => setAllDropdown(type)} style={{ padding: "10px 20px", fontSize: "16px" }}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}:
                        </button>
                        <div className={`${type}Buttons`}>
                            {renderAlbumsByType(selectedAlbums, type)}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="center">
                <h2>Submit songs for ranking:</h2>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}
