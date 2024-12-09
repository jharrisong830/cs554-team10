import { useState, useEffect, useContext } from "react";
import {
    getTrack,
    getAlbumArtwork,
    getArtist,
    getArtistImage,
    getArtistAlbums,
    getAlbumTracks
} from "./lib/spotify/data";
import { Track, Album, Artist } from "./lib/spotify/types";
import SpotifyContext from "./contexts/SpotifyContext";

export default function Selection() {
    const {stateValue} = useContext(SpotifyContext)!;
    const [currTrack, setCurrTrack] = useState<Track | null>(null);
    const [currTrackImage, setCurrTrackImage] = useState<string | null>(null);

    const [currArtist, setCurrArtist] = useState<Artist | null>(null);
    const [currArtistImage, setCurrArtistImage] = useState<string | null>(null);
    const [artistAlbums, setArtistAlbums] = useState<Array<Album> | null>(null);

    const [selectedAlbums, setSelectedAlbums] = useState<Array<Album> | null>(null); // store entire albums with true/false
    const [finalAlbums, setFinalAlbums] = useState<Array<Album> | null>(null); // what is passed to ranker

    useEffect(() => {
        stateValue
        // these funcs are only called when accessToken is not null, we can force the value with !
        const trackWrapper = async () => {
            const newTrack = await getTrack(
                stateValue.accessToken!,
                "26QLJMK8G0M06sk7h7Fkse?si=f4e3764ddc3148a0"
            );
            setCurrTrack(newTrack);
            console.log(currTrack);

            const newTrackImage = await getAlbumArtwork(
                stateValue.accessToken!,
                newTrack.albumId
            );
            setCurrTrackImage(newTrackImage);
            console.log(currTrackImage)
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

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (selectedAlbums !== undefined) {
            let finAlbums = selectedAlbums?.filter(x => x.selected === "true")!;
            setFinalAlbums(finAlbums);
            console.log(finalAlbums);
        }
    }

    const handleButton = (className: string) => {
        if(className) {
            
        }
    }

    const handleTracks = async (album: Album) => {
        let trackList = await getAlbumTracks(stateValue.accessToken!, album.spotifyId)
        album.tracks = trackList
        return album;
    }

    let artistButtons;

    const changeButtonColor = (album: Album) => {
        if (selectedAlbums?.filter(x => x.name === album.name) !== undefined) {
            let newAlbums: Array<Album>;
            if (album.selected !== "true") {
                newAlbums = selectedAlbums?.filter(x => x.name === album.name ? x.selected = "true" : x.selected = x.selected);
            } else {
                newAlbums = selectedAlbums?.filter(x => x.name !== album.name ? x.selected = x.selected : x.selected = "false");
            }
            setSelectedAlbums(newAlbums);
            console.log(newAlbums);
        }
    }

    let albumButtons;
    let singleButtons;
    let featuredButtons;
    let albums;

    if (artistAlbums !== null) {
        console.log(artistAlbums)
        artistButtons = artistAlbums.map((album) => (
            <button onClick={() => changeButtonColor(album)} style={{ padding: "10px 20px", fontSize: "16px" }} key={album.name} className={album.selected}>
                {album.name}
                <br/>
                {album.albumType}
            </button>
        ))
        albumButtons = artistButtons?.filter(x => x.props.children[2] === "album");
        albums = artistAlbums.filter(x => x.albumType === "album");
        console.log(albums)
        if (albums !== null){
            albums = albums.map(x => handleTracks(x));
        }
        console.log(albums)
        singleButtons = artistButtons?.filter(x => x.props.children[2] === "single");
        featuredButtons = artistButtons?.filter(x => x.props.children[2] === "appears_on");
    }    

    return (
        <div>
            <h1>{JSON.stringify(currArtist?.name)}</h1>
            <img src={currArtistImage ?? ""} />
            <div style={{ display: "flex", verticalAlign: "top", justifyContent: "center", gap: "10px", margin: "20px 0"}}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => handleButton("albumButtons")} style={{ padding: "10px 20px", fontSize: "16px" }}>
                        Albums:
                    </button>
                    <div className="albumButtons" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {albumButtons}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => handleButton("singleButtons")} style={{ padding: "10px 20px", fontSize: "16px" }}>
                        Singles:
                    </button>
                    <div className="singleButtons" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {singleButtons}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => handleButton("featuredButtons")} style={{ padding: "10px 20px", fontSize: "16px" }}>
                        Appears On:
                    </button>
                    <div className="featuredButtons" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {featuredButtons}
                    </div>
                </div>
            </div>
            <form
                method='POST '
                name='formName'
                className='center'
                onSubmit={handleSubmit}
            >
                <label>
                <h2>Submit songs for ranking: </h2>
                <input
                    id="songsList"
                    autoComplete='off'
                    type='submit'
                    value="Submit"
                    name='songsList'
                />
                </label>
                <br/>
                <br/>
            </form>
        </div>
    )


}