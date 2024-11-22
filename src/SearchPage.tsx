import { useEffect, useState } from "react";
// import redis from 'redis';
// const client = redis.createClient();
// client.connect().then(() => { });
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardHeader
} from "@mui/material";
import { Link } from "react-router-dom";

export default function SearchPage(props: any) {
    const [results, setResults] = useState<any>(null);
    const [searchValue, setSearchValue] = useState("album");

    const handleType = (e: any) => {
        setSearchValue(e.target.value);
    };

    useEffect(() => {
        console.log(`Search results: ${JSON.stringify(results)}`);
    }, [results]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setResults(null);
        let searchTerm: string = (
            document!.getElementById("searchTerm")! as HTMLInputElement
        ).value!;
        searchTerm = searchTerm.trim()
        if (searchTerm === ""){
            searchTerm = "Brat"
        }
        //validation..
        console.log(searchValue);
        console.log(searchTerm);
        let data
        try {
            const response = await fetch(`http://localhost:3000/redis/${searchTerm}`);
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            data = await response.json();
            data = JSON.parse(data)
        } catch (error) {
            data = await props.handleSearch(searchTerm, searchValue);
            try {
                const response = await fetch(`http://localhost:3000/redis/${searchTerm}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ data: data }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Error posting data");
                }
                const result = await response.json();
                console.log(result)
            } catch (error) {
                console.error("Error posting data:", error);
            }
        } finally {
            setResults(data);
            (document!.getElementById("searchTerm")! as HTMLInputElement).value = "";
        }
    };

    return (
        <>
            <form id="simple-form" onSubmit={handleSubmit}>
                <label>
                    Type of Search:
                    <select
                        value={searchValue}
                        name="searchType"
                        onChange={handleType}
                    >
                        <option value="album">Album</option>
                        <option value="artist">Artist</option>
                        <option value="track">Track</option>
                    </select>
                </label>
                <label>
                    Search here:
                    <input
                        id="searchTerm"
                        name="searchTerm"
                        type="text"
                        placeholder="Brat"
                    />
                </label>

                <input type="submit" value="Submit" />
            </form>
            {results != null ? (
                searchValue == "album" ? (
                    results.albums.items.map((item: any) => {
                        return (
                            <div key={item.id}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        maxWidth: 550,
                                        height: "auto",
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        borderRadius: 5,
                                        border: "1px solid #1e8678",
                                        boxShadow:
                                            "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);"
                                    }}
                                >
                                    <CardHeader
                                        title={
                                            item.name
                                                ? item.name
                                                : "unknown name"
                                        }
                                        sx={{
                                            borderBottom: "1px solid #1e8678",
                                            fontWeight: "bold"
                                        }}
                                    ></CardHeader>
                                    <CardMedia
                                        component="img"
                                        image={
                                            item.images &&
                                                item.images[0] &&
                                                item.images[0].url
                                                ? item.images[0].url
                                                : ""
                                        }
                                        title="show image"
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="span"
                                            sx={{
                                                borderBottom:
                                                    "1px solid #1e8678",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            <dl>
                                                <p>
                                                    <dt className="URL">
                                                        Spotify URL:
                                                    </dt>
                                                    <dd>
                                                        <Link
                                                            to={
                                                                item
                                                                    .external_urls
                                                                    .spotify
                                                                    ? item
                                                                        .external_urls
                                                                        .spotify
                                                                    : "unknown url"
                                                            }
                                                            target="_blank"
                                                        >
                                                            Go to Spotify
                                                            Listing
                                                        </Link>
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dt className="artists">
                                                        Artists:
                                                    </dt>
                                                    <dd>
                                                        {item.artists.map(
                                                            (artist: any) => (
                                                                <div>
                                                                    <p>
                                                                        <Link
                                                                            to={
                                                                                artist
                                                                                    .external_urls
                                                                                    .spotify
                                                                            }
                                                                        >
                                                                            {
                                                                                artist.name
                                                                            }
                                                                        </Link>
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dd>
                                                        <p>
                                                            Released{" "}
                                                            {item.release_date}{" "}
                                                            ♫{" "}
                                                            {item.total_tracks}{" "}
                                                            Tracks
                                                        </p>
                                                    </dd>
                                                </p>
                                            </dl>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })
                ) : searchValue == "artist" ? (
                    results.artists.items.map((item: any) => {
                        return (
                            <div key={item.id}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        maxWidth: 550,
                                        height: "auto",
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        borderRadius: 5,
                                        border: "1px solid #1e8678",
                                        boxShadow:
                                            "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);"
                                    }}
                                >
                                    <CardHeader
                                        title={
                                            item.name
                                                ? item.name
                                                : "unknown name"
                                        }
                                        sx={{
                                            borderBottom: "1px solid #1e8678",
                                            fontWeight: "bold"
                                        }}
                                    ></CardHeader>
                                    <CardMedia
                                        component="img"
                                        image={
                                            item.images &&
                                                item.images[0] &&
                                                item.images[0].url
                                                ? item.images[0].url
                                                : ""
                                        }
                                        title="show image"
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="span"
                                            sx={{
                                                borderBottom:
                                                    "1px solid #1e8678",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            <dl>
                                                <p>
                                                    <dt className="URL">
                                                        Spotify URL:
                                                    </dt>
                                                    <dd>
                                                        <Link
                                                            to={
                                                                item
                                                                    .external_urls
                                                                    .spotify
                                                                    ? item
                                                                        .external_urls
                                                                        .spotify
                                                                    : "unknown url"
                                                            }
                                                            target="_blank"
                                                        >
                                                            Go to Spotify
                                                            Listing
                                                        </Link>
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dt className="artists">
                                                        Genres:
                                                    </dt>
                                                    <dd>
                                                        {item.genres.map(
                                                            (genre: any) => (
                                                                <p>{genre}</p>
                                                            )
                                                        )}
                                                    </dd>
                                                </p>
                                                <p>
                                                    <p>
                                                        Spotify followers:{" "}
                                                        {item.followers.total}
                                                    </p>
                                                </p>
                                            </dl>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })
                ) : (
                    results.tracks.items.map((item: any) => {
                        return (
                            <div key={item.id}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        maxWidth: 550,
                                        height: "auto",
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        borderRadius: 5,
                                        border: "1px solid #1e8678",
                                        boxShadow:
                                            "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);"
                                    }}
                                >
                                    <CardHeader
                                        title={
                                            item.name
                                                ? item.name
                                                : "unknown name"
                                        }
                                        sx={{
                                            borderBottom: "1px solid #1e8678",
                                            fontWeight: "bold"
                                        }}
                                    ></CardHeader>
                                    <CardMedia
                                        component="img"
                                        image={
                                            item.album.images &&
                                                item.album.images[0] &&
                                                item.album.images[0].url
                                                ? item.album.images[0].url
                                                : ""
                                        }
                                        title="show image"
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="span"
                                            sx={{
                                                borderBottom:
                                                    "1px solid #1e8678",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            <dl>
                                                <p>
                                                    <dt className="artists">
                                                        Artists:
                                                    </dt>
                                                    <dd>
                                                        {item.artists.map(
                                                            (artist: any) => (
                                                                <div>
                                                                    <p>
                                                                        <Link
                                                                            to={
                                                                                artist
                                                                                    .external_urls
                                                                                    .spotify
                                                                            }
                                                                        >
                                                                            {
                                                                                artist.name
                                                                            }
                                                                        </Link>
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dt className="URL">
                                                        Spotify URL:
                                                    </dt>
                                                    <dd>
                                                        <Link
                                                            to={
                                                                item
                                                                    .external_urls
                                                                    .spotify
                                                                    ? item
                                                                        .external_urls
                                                                        .spotify
                                                                    : "unknown url"
                                                            }
                                                            target="_blank"
                                                        >
                                                            Go to Spotify
                                                            Listing
                                                        </Link>
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dd>
                                                        Track{" "}
                                                        {item.track_number} on{" "}
                                                        {item.album.name}
                                                    </dd>
                                                </p>
                                            </dl>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })
                )
            ) : (
                <h2>Search for an artist, track, or album!</h2>
            )}
        </>
    );
}
