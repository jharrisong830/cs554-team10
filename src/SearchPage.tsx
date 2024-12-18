import { useEffect, useRef, useState, useContext } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardHeader,
} from "@mui/material";
import GroupsIcon from '@mui/icons-material/Groups';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import LaunchIcon from '@mui/icons-material/Launch';
import Grid from "@mui/material/Grid2"
import SpotifyContext from "./contexts/SpotifyContext";
import { Link } from "react-router-dom";
import "./App.css";
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
    if (typeof window === "undefined") return [];
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
    const searchValue = "artist";
    const [searchTerm, setSearchTerm] = useState("");
    const [newPage, setPage] = useState(1);
    const recentSearches = useRef<string[]>(loadRecentSearches());
    const { stateValue } = useContext(SpotifyContext)!;
    console.log("state value:");
    console.log(stateValue);



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
        let trimmedSearchTerm = searchTerm.trim();
        trimmedSearchTerm = trimmedSearchTerm.toLowerCase()
        const finalSearchTerm = trimmedSearchTerm || "sabrina carpenter";
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

    let artistCards;

    if (results != null) {
        artistCards = results.artists.items && results.artists.items.map((item: any) => {
            if (!item || !item.name || !item.id) return null;
            return (
                <div key={item.id}>
                    <br />
                    <Grid size={10} key={item.id}>
                        <Card
                            variant="outlined"
                            sx={{
                                maxWidth: 550,
                                height: "auto",
                                marginLeft: "auto",
                                marginRight: "auto",
                                borderRadius: 5,
                                border: "4px solid #f9a8d4",
                                boxShadow:
                                    "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);",
                                backgroundColor: "lavender",
                            }}
                        >
                            <CardHeader
                                title={item.name || "unknown name"}
                                sx={{
                                    borderBottom: "1px solid #1e8678",
                                    fontWeight: "bold",
                                    fontFamily: "system-ui"
                                }}
                            />
                            <CardMedia
                                sx={{ width: 500 }}
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
                                    <div>
                                        <p
                                            className="URL font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5 italic">
                                            <LaunchIcon /> Spotify URL:
                                        </p>
                                        <br />
                                        <div>
                                            <Link
                                                to={item?.external_urls?.spotify || "#"}
                                                target="_blank"
                                                className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                                            >
                                                Spotify Listing
                                            </Link>
                                            <Link
                                                to={`/artist/${item.id}`}
                                                state={{ token: stateValue.accessToken }}
                                                className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                                            >
                                                Artist's Page
                                            </Link>
                                        </div>
                                    </div>
                                    <br />
                                    <div>
                                        <p
                                            className="artists font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5 italic"
                                        >
                                            <LibraryMusicIcon /> Genres: {item?.genres.length === 0 ? "N/A" : ""}
                                        </p>
                                        <div>
                                            {item?.genres?.map((genre: any) => (
                                                <p key={genre} className="bg-yellow-200 text-black border-pink-600 border-2 rounded px-2 py-2 p-2 m-4">{genre}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5 italic">
                                            
                                            <GroupsIcon /> Spotify followers: {item.followers.total}
                                        </p>
                                    </div>
                                    <br />
                                </Typography>
                                <Link
                                    to={`/selection/${item.id}`}
                                    state={{ type: "artist", id: item.id }}
                                    className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                                >
                                    Go to Selection
                                </Link>
                            </CardContent>
                        </Card>
                    </Grid>
                </div>
            );
        })
    } else {
        artistCards = (
            <div>
                <br />
                <h2 className="text-2xl font-bold">Search for any artist on Spotify!</h2>
            </div>)
    }

    return (
        <>
            <form id="simple-form" onSubmit={handleSubmit} className="bg-violet-100 border-4 rounded px-2 py-1 border-pink-300 flex md:justify-center items-center space-x-4 p-4">
                <label
                    className="flex items-center space-x-2"
                >
                    <p className="mr-2 font-websiteFont">
                        Search Artist here:
                    </p>
                    <input
                        id="searchTerm"
                        name="searchTerm"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Sabrina Carpenter"
                        list="recent-searches"
                        className="border text-black rounded px-2 py-1"
                        style={{ color: "white" }}
                    />
                </label>
                <datalist id="recent-searches">
                    {recentSearches.current.map((term, index) => (
                        <option key={index} value={term} />
                    ))}
                </datalist>
                <input type="submit" value="Submit" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3" />
            </form>

            <Grid container justifyContent="center">
                {artistCards}
            </Grid>


            <div className="flex-none items-center x-4 p-4">
                {results != null && (results.artists && results.artists.offset > 0) && searchTerm != "" ? <button className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3" onClick={() => setPage(newPage - 1)}>Previous Page</button> : ""}
                {results != null && (results.artists && results.artists.next != null) && searchTerm != "" ? <button className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3" onClick={() => setPage(newPage + 1)}>Next Page</button> : ""}
                {results != null && (results.artists && results.artists.next != null) && searchTerm === "" ? <p className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Search an artist to see multiple results pages!</p> : ""}
            </div>
            {results != null ? (<p className="mt-4 px-4 py-2 bg-violet-300 text-black font-spotify font-semibold rounded transition m-3">Current page: {newPage}</p>) : ""}
        </>
    );
}