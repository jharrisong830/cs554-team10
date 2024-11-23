import { useEffect, useState } from "react";
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
    const [searchTerm, setSearchTerm] = useState("");

    const handleType = (e: any) => {
        setResults(null);
        setSearchValue(e.target.value);
    };

    useEffect(() => {
        //console.log(`Search results: ${JSON.stringify(results)}`);
    }, [results]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setResults(null);
        const trimmedSearchTerm = searchTerm.trim();
        const finalSearchTerm = trimmedSearchTerm === "" ? "Brat" : trimmedSearchTerm;
        let data;
        try {
            const response = await fetch(`/api/redis?searchTerm=${finalSearchTerm}&searchValue=${searchValue}`);
            if (response.ok) {
                data = await response.json();
                data = data.data
                console.log('Data fetched from Redis:', data);
            } else {
                throw new Error('Data not found in Redis');
            }
        } catch (error) {
            console.log(error);
            data = await props.handleSearch(finalSearchTerm, searchValue);
            console.log(data)  
            try {
                const redisResponse = await fetch(`/api/redis?searchTerm=${finalSearchTerm}&searchValue=${searchValue}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: data }),
                });
                if (!redisResponse.ok) {
                    const errorData = await redisResponse.json();
                    throw new Error(errorData.error || "Error posting data to Redis");
                }
                const redisResult = await redisResponse.json();
                console.log('Data successfully posted to Redis:', redisResult);
            } catch (error) {
                console.error("Error posting data to Redis:", error);
            }
        } finally {
            setResults(data);
            setSearchTerm(""); 
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} // Use controlled component for search term
                        placeholder="Brat"
                    />
                </label>
                <input type="submit" value="Submit" />
            </form>

            {results != null ? (
                searchValue === "album" ? (
                    results.albums.items.map((item: any) => {
                        if (!item || !item.name || !item.id) return null;
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
                                        title={item.name || "unknown name"}
                                        sx={{
                                            borderBottom: "1px solid #1e8678",
                                            fontWeight: "bold"
                                        }}
                                    />
                                    <CardMedia
                                        component="img"
                                        image={item?.images?.[0]?.url || ""}
                                        title="show image"
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="span"
                                            sx={{
                                                borderBottom: "1px solid #1e8678",
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
                                                            to={item?.external_urls?.spotify || "#"}
                                                            target="_blank"
                                                        >
                                                            Go to Spotify Listing
                                                        </Link>
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dt className="artists">
                                                        Artists:
                                                    </dt>
                                                    <dd>
                                                        {item?.artists?.map((artist: any) => (
                                                            <div key={artist.id}>
                                                                <p>
                                                                    <Link to={artist.external_urls.spotify}>
                                                                        {artist.name}
                                                                    </Link>
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dd>
                                                        <p>
                                                            Released {item?.release_date} ♫ {item?.total_tracks} Tracks
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
                ) : searchValue === "artist" ? (
                    results.artists.items.map((item: any) => {
                        if (!item || !item.name || !item.id) return null;
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
                                        title={item.name || "unknown name"}
                                        sx={{
                                            borderBottom: "1px solid #1e8678",
                                            fontWeight: "bold"
                                        }}
                                    />
                                    <CardMedia
                                        component="img"
                                        image={item?.images?.[0]?.url || ""}
                                        title="show image"
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="span"
                                            sx={{
                                                borderBottom: "1px solid #1e8678",
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
                                                            to={item?.external_urls?.spotify || "#"}
                                                            target="_blank"
                                                        >
                                                            Go to Spotify Listing
                                                        </Link>
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dt className="artists">
                                                        Genres:
                                                    </dt>
                                                    <dd>
                                                        {item?.genres?.map((genre: any) => (
                                                            <p key={genre}>{genre}</p>
                                                        ))}
                                                    </dd>
                                                </p>
                                                <p>
                                                    <p>Spotify followers: {item.followers.total}</p>
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
                        if (!item || !item.name || !item.id) return null;
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
                                        title={item.name || "unknown name"}
                                        sx={{
                                            borderBottom: "1px solid #1e8678",
                                            fontWeight: "bold"
                                        }}
                                    />
                                    <CardMedia
                                        component="img"
                                        image={item?.album?.images?.[0]?.url || ""}
                                        title="show image"
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            component="span"
                                            sx={{
                                                borderBottom: "1px solid #1e8678",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            <dl>
                                                <p>
                                                    <dt className="artists">
                                                        Artists:
                                                    </dt>
                                                    <dd>
                                                        {item?.artists?.map((artist: any) => (
                                                            <div key={artist.id}>
                                                                <p>
                                                                    <Link to={artist.external_urls.spotify}>
                                                                        {artist.name}
                                                                    </Link>
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dt className="URL">
                                                        Spotify URL:
                                                    </dt>
                                                    <dd>
                                                        <Link
                                                            to={item?.external_urls?.spotify || "#"}
                                                            target="_blank"
                                                        >
                                                            Go to Spotify Listing
                                                        </Link>
                                                    </dd>
                                                </p>
                                                <p>
                                                    <dd>
                                                        Track {item.track_number} on {item.album.name}
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
