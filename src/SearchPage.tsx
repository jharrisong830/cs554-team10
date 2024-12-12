import { useEffect, useRef, useState } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardHeader
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
const RECENT_SEARCHES_KEY = "recentSearches";
const EXPIRY_TIME_MS = 60 * 60 * 1000; //1 Hour
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
    if (typeof window === "undefined") return []; // Ensure this runs only on the client
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
    const [newPage, setPage] = useState(1);
    const recentSearches = useRef<string[]>(loadRecentSearches());
    // const cache = useRef<Map<string, any>>(new Map());
    const handleType = (e: any) => {
        setResults(null);
        setPage(1);
        setSearchValue(e.target.value);
    };

    const navigate = useNavigate();

    const handleSelectionNav = (id: string) => {
        console.log(id);
        navigate("/selection", { state: { id } });
    };

    useEffect(() => {
        console.log("Recent Searches:", recentSearches.current);
    }, []);

    useEffect(() => {
        console.log("Events useEffect triggered");
        async function fetchPage() {
            try {

                if (results != null) {
                    const data = await props.handleSearch(searchTerm, searchValue, newPage);
                    setResults(data);
                }
            } catch (e) {
                console.log(e);
            }
        }
        fetchPage();
    }, [newPage]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setResults(null);
        setPage(1);
        const trimmedSearchTerm = searchTerm.trim();
        const finalSearchTerm = trimmedSearchTerm || "Brat";
        const cacheKey = `${searchValue}:${finalSearchTerm}`;

        try {
            const fetchRedisData = async () => {
                const response = await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${searchValue}`, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });
                if (!response.ok) throw new Error("Data not found in Redis");
                return response.json();
            };

            const result = await fetchRedisData();
            setResults(result.data);
            updateRecentSearches(cacheKey);
        } catch (error) {
            console.error("Redis fetch error:", error);
            const externalData = await props.handleSearch(finalSearchTerm, searchValue);
            setResults(externalData);
            console.log("Data fetched from external API:", externalData);

            try {
                await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${searchValue}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ data: externalData }),
                });
                console.log("Data successfully saved to Redis");
            } catch (redisError) {
                console.error("Error saving data to Redis:", redisError);
            }
        }

        //setSearchTerm("");
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
                                                <div>
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
                                                </div>
                                                <div>
                                                    <dd>
                                                        <p>
                                                            Released {item?.release_date} ♫ {item?.total_tracks} Tracks
                                                        </p>
                                                    </dd>
                                                </div>
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
                                        <Button // @ts-ignore 
                                            as={Link} to="/selection" 
                                            variant="primary"
                                            onClick={() => {
                                                handleSelectionNav(item.id);
                                            }}
                                        >
                                            Go to Selection
                                        </Button>
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
            {results != null && ((results.albums && results.albums.offset > 0) || (results.tracks && results.tracks.offset > 0) || (results.artists && results.artists.offset > 0))  ? <button onClick={() => setPage(newPage-1)}>Previous Page</button> : ""}
        <p>Current page: {newPage}</p>
        {results != null && ((results.albums && results.albums.next != null) || (results.tracks && results.tracks.next != null) || (results.artists && results.artists.next != null)) ?<button onClick={() => setPage(newPage+1)}>Next Page</button>: ""}
        
        </>
    );
}
