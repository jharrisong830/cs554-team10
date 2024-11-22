import { useState, useEffect, useContext } from "react";
import {
    getTrack,
    getAlbum,
    getAlbumArtwork,
    getArtist,
    getArtistImage,
    getArtistAlbums
} from "./lib/spotify/data";
import { Track, Album, Artist } from "./lib/spotify/types";
import SpotifyContext from "./contexts/SpotifyContext";

export default function Selection() {
    const {stateValue} = useContext(SpotifyContext)!;
    const [currTrack, setCurrTrack] = useState<Track | null>(null);
    const [currAlbum, setCurrAlbum] = useState<Album | null>(null);
    const [currTrackImage, setCurrTrackImage] = useState<string | null>(null);
    const [currAlbumImage, setCurrAlbumImage] = useState<string | null>(null);

    const [currArtist, setCurrArtist] = useState<Artist | null>(null);
    const [currArtistImage, setCurrArtistImage] = useState<string | null>(null);
    const [artistAlbums, setArtistAlbums] = useState<Array<Album> | null>(null);

    const [selectedAlbums, setSelectedAlbums] = useState<Array<Album> | null>(null); // store entire albums with true/false

    useEffect(() => {
        stateValue
        // these funcs are only called when accessToken is not null, we can force the value with !
        const trackWrapper = async () => {
            const newTrack = await getTrack(
                stateValue.accessToken!,
                "26QLJMK8G0M06sk7h7Fkse?si=f4e3764ddc3148a0"
            );
            setCurrTrack(newTrack);

            const newTrackImage = await getAlbumArtwork(
                stateValue.accessToken!,
                newTrack.albumId
            );
            setCurrTrackImage(newTrackImage);
        };

        const artistWrapper = async () => {
            const newArtist = await getArtist(stateValue.accessToken!, "4kqFrZkeqDfOIEqTWqbOOV");
            setCurrArtist(newArtist);

            const newArtistImage = await getArtistImage(stateValue.accessToken!, "4kqFrZkeqDfOIEqTWqbOOV");
            setCurrArtistImage(newArtistImage);
        };

        const artistAlbumsWrapper = async () => {
            const newAlbums = await getArtistAlbums(stateValue.accessToken!, "4kqFrZkeqDfOIEqTWqbOOV");
            setArtistAlbums(newAlbums);
            setSelectedAlbums(newAlbums);
        };

        if (stateValue.accessToken !== null) {
            trackWrapper();
            artistWrapper();
            artistAlbumsWrapper();
        }    
    }, [stateValue]);

    let artistButtons;

    const changeButtonColor = (album: Album) => {
        if (selectedAlbums?.filter(x => x.name === album.name) !== undefined) {
            let newAlbums: Array<Album>;
            if (album.selected !== "true") {
                newAlbums = selectedAlbums?.filter(x => x.name === album.name ? x.selected = "true" : x.selected = x.selected);
                // have to push album with that name into selected albums
            } else {
                newAlbums = selectedAlbums?.filter(x => x.name !== album.name ? x.selected = x.selected : x.selected = "false");
            }
            setSelectedAlbums(newAlbums);
        }
    }

    if (artistAlbums !== null) {
        artistButtons = artistAlbums.map((album) => (
            <button onClick={() => changeButtonColor(album)} style={{ padding: "10px 20px", fontSize: "16px" }} key={album.name} className={album.selected}>
                {album.name}
            </button>
        ))
    }    

    return (
        <div>
            <h1>{JSON.stringify(currArtist?.name)}</h1>
            <img src={currArtistImage ?? ""} />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", margin: "20px 0"}}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {artistButtons}
                </div>
            </div>
            <p>{selectedAlbums?.map(album => album.name + " | ")}</p>
        </div>

    )


}