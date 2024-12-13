import { useState, useEffect, useContext, useRef } from "react";
import {
    getArtist,
    getArtistImage,
    getArtistAlbums,
    fetchTracksForAlbums
} from "./lib/spotify/data";
import { Album, Artist, SongData, TierItemProps } from "./lib/spotify/types";
import SpotifyContext from "./contexts/SpotifyContext";
import { SongDataArray } from "./lib/spotify/types";
import { useNavigate, useLocation } from "react-router-dom";
function morphSongDataToTierItemProps(songs: SongData[]): TierItemProps[] {
    return songs.map((song) => ({
        id: song.spotifyId,
        imageUrl: song.images[0]?.url,
        altText: song.name,
    }));
}
const API_URL =
    process.env.NODE_ENV === "production"
        ? "https://cs554-team10.vercel.app/api/redis"
        : "/api/redis";

export default function Selection() {
    const { stateValue } = useContext(SpotifyContext)!;
    const [currArtist, setCurrArtist] = useState<Artist | null>(null);
    const [currArtistImage, setCurrArtistImage] = useState<string | null>(null);
    const [selectedAlbums, setSelectedAlbums] = useState<Array<Album> | null>(null);
    const [trackDropdowns, setTrackDropdowns] = useState<{ [key: string]: boolean }>({});
    const hasFetchedData = useRef(false);
    const [allAlbums, setAllAlbums] = useState(true);
    const [allSingles, setAllSingles] = useState(true);
    const navigate = useNavigate();
    let {state} = useLocation();
    const row = {
        rowId: "1",
        items: [],
        color: "red",
        letter: "A",
    }
    useEffect(() => {
        const fetchAllData = async () => {
            if (hasFetchedData.current || !stateValue.accessToken) return;
            const finalSearchTerm = "selection"
            try {
                const fetchRedisData = async () => {
                    const response = await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${state.id}`, {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    });
                    if (!response.ok) throw new Error("Data not found in Redis");
                    return response.json();
                };
                const result = await fetchRedisData();
                setCurrArtist(result.data.artist);
                setCurrArtistImage(result.data.artistImage);
                setCurrArtistImage(result.data.tracks);
                hasFetchedData.current = true;
            }
            catch (error) {
                console.error("Redis fetch error:", error);
                try {
                    const [artist, artistImage, albums] = await Promise.all([
                        getArtist(stateValue.accessToken, state.id),
                        getArtistImage(stateValue.accessToken, state.id),
                        getArtistAlbums(stateValue.accessToken, state.id),
                    ]);
                    const albumsWithNoAppearsOn = albums.filter((album) => album.albumType !== 'appears_on')
                    const albumsWithTracks = await fetchTracksForAlbums(stateValue.accessToken, albumsWithNoAppearsOn);
                    setCurrArtist(artist);
                    setCurrArtistImage(artistImage);
                    const tracks = albumsWithTracks.map((album) => ({ ...album, selected: true }))
                    setSelectedAlbums(tracks);
                    const redis = {
                        artist: artist,
                        artistImage: artistImage,
                        tracks: tracks
                    }
                    hasFetchedData.current = true;
                    try {
                        await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${state.id}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ data: redis }),
                        });
                        console.log("Data successfully saved to Redis");
                    } catch (redisError) {
                        console.error("Error saving data to Redis:", redisError);
                        hasFetchedData.current = true;
                    }
                } catch (error) {
                    console.error("Error fetching Spotify data:", error);
                    hasFetchedData.current = true;
                }
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
        if (updatedAlbums !== undefined) {
            setSelectedAlbums(updatedAlbums);
        }
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
        if (updatedAlbums !== undefined) {
            setSelectedAlbums(updatedAlbums);
        }
    };

    const renderTracks = (tracks: Array<{ name: string; spotifyId: string; selected: boolean }>, albumId: string) => {
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
                ? { ...album, selected: !album.selected, tracks: album.tracks.map((track) => ({ ...track, selected: !track.selected })) }
                : album
        );
        if (updatedAlbums !== undefined) {
            setSelectedAlbums(updatedAlbums);
        }
    };

    const setAllDropdown = (type: string) => {
        let bool: boolean;
        if (type === "album") {
            bool = !allAlbums;
            setAllAlbums(!allAlbums);
        } else if (type === "single") {
            bool = !allSingles;
            setAllSingles(!allSingles);
        }
        const updatedAlbums = selectedAlbums?.map((album) =>
            album.albumType === type ? { ...album, selected: bool, tracks: album.tracks.map((track) => ({ ...track, selected: bool })) } : album
        );
        if (updatedAlbums !== undefined) {
            setSelectedAlbums(updatedAlbums);
        }
    };
    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const finAlbums = selectedAlbums?.map((album) => {
            const selectedTracks = album.tracks.filter((track) => track.selected);
            return { ...album, tracks: selectedTracks };
        }).filter((album) => album.tracks.length > 0);
        const allTracksWithAlbumData = finAlbums?.flatMap((album) =>
            album.tracks.map((track) => ({
                ...track,
                platformURLAlbum: album.platformURL,
                albumName: album.name,
                images: album.images
            }))
        );
        const songDataToSort: SongDataArray = allTracksWithAlbumData ?? [];
        console.log(songDataToSort)
        navigate("/ranker", { state: { songDataToSort } });
    };
    const handleSubmit2 = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const finAlbums = selectedAlbums?.map((album) => {
            const selectedTracks = album.tracks.filter((track) => track.selected);
            return { ...album, tracks: selectedTracks };
        }).filter((album) => album.tracks.length > 0);
        const allTracksWithAlbumData = finAlbums?.flatMap((album) =>
            album.tracks.map((track) => ({
                ...track,
                platformURLAlbum: album.platformURL,
                albumName: album.name,
                images: album.images
            }))
        );
        const songDataToSort: SongDataArray = allTracksWithAlbumData ?? [];
        const tierItems: TierItemProps[] = morphSongDataToTierItemProps(songDataToSort)
        navigate("/tierlist", { state: { tierItems, currArtist, row } });
    };
    if (!selectedAlbums) {
        return <h1>{currArtist?.name ?? "Loading..."}</h1>
    }
    return (
        <div>
            <h1>{currArtist?.name ?? "Loading..."}</h1>
            <img src={currArtistImage ?? ""} alt="Artist" />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "20px 0" }}>
                {["album", "single"].map((type) => (
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
            <div>
                <button onClick={handleSubmit}>Go to Ranker</button>
            </div>
            <div>
                <button onClick={handleSubmit2}>Go to TierList</button>
            </div>
        </div>
    );
}
