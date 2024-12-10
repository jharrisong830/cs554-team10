import { useState, useEffect, useContext } from "react";
import {
    getArtist,
    getArtistImage,
    getArtistAlbums,
    getAlbumTracks
} from "./lib/spotify/data";
import { Album, Artist } from "./lib/spotify/types";
import SpotifyContext from "./contexts/SpotifyContext";

export default function Selection() {
    const {stateValue} = useContext(SpotifyContext)!;

    const [currArtist, setCurrArtist] = useState<Artist | null>(null);
    const [currArtistImage, setCurrArtistImage] = useState<string | null>(null);
    const [artistAlbums, setArtistAlbums] = useState<Array<Album> | null>(null);

    const [selectedAlbums, setSelectedAlbums] = useState<Array<Album> | null>(null); // store entire albums with true/false
    const [finalAlbums, setFinalAlbums] = useState<Array<Album> | null>(null); // what is passed to ranker

    useEffect(() => {
        stateValue
        // these funcs are only called when accessToken is not null, we can force the value with !

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

    // const handleButton = (button: string, status: boolean) => {
    //     if(status) {
    //         if (button === "album") {
    //             setAlbumDropdown(false);
    //         } else if (button === "single") {
    //             setSingleDropdown(false);
    //         } else {
    //             setFeaturedDropdown(false);
    //         }
    //     } else {
    //         if (button === "album") {
    //             setAlbumDropdown(true);
    //         } else if (button === "single") {
    //             setSingleDropdown(true);
    //         } else {
    //             setFeaturedDropdown(true);
    //         }
    //     }
    // }

    const handleTracks = async (album: Album) => {
        let trackList = await getAlbumTracks(stateValue.accessToken!, album.spotifyId)
        if(album.selected === "false") {
            trackList = trackList.filter(track => track.selected === "true" ? track.selected = "false" : track.selected = track.selected);
        }
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
        }
        console.log(selectedAlbums)
    }

    // set all albums/tracks in that dropdown to false
    const setAllDropdown = (type: string) => {
        let filteredAlbums;
        if (type === "album") {
            filteredAlbums = selectedAlbums?.filter(x => x.albumType === "album");
        } else if (type === "single") {
            filteredAlbums = selectedAlbums?.filter(x => x.albumType === "single");
        } else {
            filteredAlbums = selectedAlbums?.filter(x => x.albumType === "appears_on");
        }
        filteredAlbums?.map((album) => changeButtonColor(album));
    }

    const handleAlbums = async (album, albumButtons) => {
        let button = albumButtons.filter((button) => button.key === album.name);
        console.log(button);
    }

    let albumButtons;
    let singleButtons;
    let featuredButtons;
    let albums;

    if (artistAlbums !== null) {
        artistButtons = artistAlbums.map((album) => (
            <button onClick={() => changeButtonColor(album)} style={{ padding: "10px 20px", fontSize: "16px" }} key={album.name} className={album.selected}>
                {album.name}
                <br/>
                {album.albumType}
            </button>
        ))
        albumButtons = artistButtons?.filter(x => x.props.children[2] === "album");
        albums = artistAlbums.filter(x => x.albumType === "album");
        if (albums !== null){
            albums = albums.map(x => handleTracks(x));
        }
        if(albumButtons !== null && albums !== null) {
            albums.map(album => handleAlbums(album, albumButtons));
        }
        singleButtons = artistButtons?.filter(x => x.props.children[2] === "single");
        featuredButtons = artistButtons?.filter(x => x.props.children[2] === "appears_on");
    }    

    return (
        <div>
            <h1>{JSON.stringify(currArtist?.name)}</h1>
            <img src={currArtistImage ?? ""} />
            <div style={{ display: "flex", verticalAlign: "top", justifyContent: "center", gap: "10px", margin: "20px 0"}}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => setAllDropdown("album")} style={{ padding: "10px 20px", fontSize: "16px" }}>
                        Albums:
                    </button>
                    <div className="albumButtons" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {albumButtons}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => setAllDropdown("single")} style={{ padding: "10px 20px", fontSize: "16px" }}>
                        Singles:
                    </button>
                    <div className="singleButtons" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {singleButtons}
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => setAllDropdown("featured")} style={{ padding: "10px 20px", fontSize: "16px" }}>
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