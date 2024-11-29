import { useEffect, useRef, useState } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardHeader,
} from "@mui/material";
import { Link } from "react-router-dom"; 
const RECENT_SEARCHES_KEY = "recentSearches";
const EXPIRY_TIME_MS = 60 * 60 * 1000; //1 Hour
const REDISURL = import.meta.env.VITE_REDIS_URL
const API_URL =
    process.env.NODE_ENV === "production"
        ? "https://cs554-team10.vercel.app/api/redis"
        : "/api/redis";

const saveRecentSearches = (searches: string[]) => {
    const data = {
        searches,
        timestamp: Date.now(), 
    };
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(data));
};
const loadRecentSearches = (): string[] => {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (data) {
        const { searches, timestamp } = JSON.parse(data);
        if (Date.now() - timestamp < EXPIRY_TIME_MS) {
            return searches;
        }
    }
    return [];
};

export default function SearchPage(props: any) {
    const [results, setResults] = useState<any>(null);
    const [searchValue, setSearchValue] = useState("album");
    const [searchTerm, setSearchTerm] = useState("");
    const recentSearches = useRef<string[]>(loadRecentSearches());
    // const cache = useRef<Map<string, any>>(new Map());
    const handleType = (e: any) => {
        setResults(null);
        setSearchValue(e.target.value);
    };

    useEffect(() => {
        console.log("Recent Searches:", recentSearches.current);
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log(API_URL)
        console.log(REDISURL)
        setResults(null);
        const trimmedSearchTerm = searchTerm.trim();
        const finalSearchTerm = trimmedSearchTerm === "" ? "Brat" : trimmedSearchTerm;
        const cacheKey = `${searchValue}:${finalSearchTerm}`;
        // if (cache.current.has(cacheKey)) {
        //     console.log("Data retrieved from client-side cache");
        //     setResults(cache.current.get(cacheKey));
        //     updateRecentSearches(cacheKey);
        //     setSearchTerm("");
        //     return;
        // }
        let data;
        data = await props.handleSearch(finalSearchTerm, searchValue);
        try {
            // Fetch data from Redis via API
            const response = await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${searchValue}`);
            if (response.ok) {
                const result = await response.json();
                data = result.data;
                console.log("Data fetched from Redis:", data);
            } else {
                throw new Error("Data not found in Redis");
            }
        } catch (error) {
            console.log("Redis fetch error:", error);
            data = await props.handleSearch(finalSearchTerm, searchValue);
            console.log("Data fetched from external API:", data);
            try {
                await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${searchValue}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data }),
                });
                console.log("Data successfully saved to Redis");
            } catch (redisError) {
                console.error("Error saving data to Redis:", redisError);
            }
        }
        // cache.current.set(cacheKey, data);
        updateRecentSearches(cacheKey);
        setResults(data);
        setSearchTerm("");
    };

    const updateRecentSearches = (searchTerm: string) => {
        const recent = recentSearches.current;
        const termToStore = searchTerm.includes(":")
            ? searchTerm.split(":")[1].trim()
            : searchTerm;
        const index = recent.indexOf(termToStore);
        if (index > -1) {
            recent.splice(index, 1);
        }
        recent.push(termToStore);
        if (recent.length > 10) {
            recent.shift();
        }
        saveRecentSearches(recent);
    };

    return (
        <>
            <form id="simple-form" onSubmit={handleSubmit}>
                <label>
                    Type of Search:
                    <select value={searchValue} name="searchType" onChange={handleType}>
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Brat"
                        list="recent-searches" // Attach the dropdown list
                    />
                </label>
                <datalist id="recent-searches">
                    {recentSearches.current.map((term, index) => (
                        <option key={index} value={term} />
                    ))}
                </datalist>
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
