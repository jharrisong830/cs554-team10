import { useEffect, useRef, useState, useContext } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardHeader
} from "@mui/material";
import SpotifyContext from "./contexts/SpotifyContext";
import { Link} from "react-router-dom";
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
    const searchValue = "artist";
    const [searchTerm, setSearchTerm] = useState("");
    const [newPage, setPage] = useState(1);
    const recentSearches = useRef<string[]>(loadRecentSearches());
    // const cache = useRef<Map<string, any>>(new Map());
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
        const trimmedSearchTerm = searchTerm.trim();
        const finalSearchTerm = trimmedSearchTerm || "Bruno Mars";
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

    return (
        <>
            <form id="simple-form" onSubmit={handleSubmit} className="flex items-center space-x-4 p-4" style={{ backgroundColor:"lavender" }}>
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
                        list="recent-searches" // Attach the dropdown list
                        className="border rounded px-2 py-1"
                        style={{ color: "white" }}
                    />
                </label>
                <datalist id="recent-searches">
                    {recentSearches.current.map((term, index) => (
                        <option key={index} value={term} />
                    ))}
                </datalist>
                <input type="submit" value="Submit" className="navbarButtons"/>
            </form>

            {results != null ? (
                    results.artists.items.map((item: any) => {
                        if (!item || !item.name || !item.id) return null;
                        return (
                            <div key={item.id}>
                                <br />
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
                                            <p>
                                                <p 
                                                    className="URL font-sans bg-[#b3f8b1] border-none text-black p-2.5 m-2.5 italic">
                                                    Spotify URL:
                                                </p>
                                                <br />
                                                <div>
                                                    <Link
                                                        to={item?.external_urls?.spotify || "#"}
                                                        target="_blank"
                                                        className="navbarButtons"
                                                        style={{ fontFamily: "system-ui" }}
                                                    >
                                                        Spotify Listing
                                                    </Link>
                                                    <Link 
                                                        to={`/artist/${item.id}`}
                                                        state= {{token:stateValue.accessToken}}
                                                        className="navbarButtons"
                                                        style={{ fontFamily: "system-ui" }}
                                                    >
                                                        Artist's Page
                                                    </Link>
                                                </div>
                                            </p>
                                            <br />
                                            <p>
                                                <p 
                                                    className="artists font-sans bg-[#b3f8b1] border-none text-black p-2.5 m-2.5 italic"
                                                >
                                                    Genres:
                                                </p>
                                                <p>
                                                    {item?.genres?.map((genre: any) => (
                                                        <p key={genre} className="genreDisplay">{genre}</p>
                                                    ))}
                                                </p>
                                            </p>
                                            <p>
                                                <p className="font-sans bg-[#b3f8b1] border-none text-black p-2.5 m-2.5 italic">
                                                    Spotify followers: {item.followers.total}
                                                </p>
                                            </p>
                                            <br />
                                        </Typography>
                                        <Link 
                                            to={"/selection"}
                                            state= {{type: "artist", id: item.id}}
                                            className="navbarButtons"
                                        >
                                            Go to Selection
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })
                ) :  (
                <div>
                    <br />
                    <h2 className="text-2xl font-bold">Search for any artist on Spotify!</h2>
                </div>
            )}
            {results != null && (results.artists && results.artists.offset > 0)  ? <button onClick={() => setPage(newPage-1)}>Previous Page</button> : ""}
        {results != null ? (<p>Current page: {newPage}</p>) : ""}
        {results != null && ( results.artists && results.artists.next != null) ?<button onClick={() => setPage(newPage+1)}>Next Page</button>: ""}
        
        </>
    );
}

