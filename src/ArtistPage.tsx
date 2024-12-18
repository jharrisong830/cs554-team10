import { useEffect, useState, } from "react";
import {
  Divider,
  Chip,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CardMedia
} from "@mui/material";
import GroupsIcon from '@mui/icons-material/Groups';
import Grid from '@mui/material/Grid2';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link, useParams, useLocation } from "react-router-dom";
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://cs554-team10.vercel.app/api/redis"
    : "/api/redis";

export default function ArtistPage(props: any) {
  // const cache = useRef<Map<string, any>>(new Map());

  let id = useParams();
  let loc = useLocation();

  const [results, setResults] = useState<any>(null);
  const [albumResults, setAlbumResults] = useState<any>(null);
  useEffect(() => {
    console.log("Artist useEffect triggered");
    const finalSearchTerm = 'artistPage'
    async function fetchPage() {
      try {
        const fetchRedisData = async () => {
          const response = await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${id.id}`, {
            method: "GET",
            headers: { Accept: "application/json" },
          });
          if (!response.ok) throw new Error("Data not found in Redis");
          return response.json();
        };
        const result = await fetchRedisData();
        console.log(result.data)
        setResults(result.data.data);
        setAlbumResults(result.data.data2);
      } catch (error) {
        console.error("Redis fetch error:", error);
        try {
          const data = await props.handleArtist(loc.state.token, id.id);
          console.log(data);
          setResults(data);
          const data2 = await props.handleAlbums(loc.state.token, id.id);
          setAlbumResults(data2);
          const redis = {
            data: data,
            data2: data2,
          }
          try {
            await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${id.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: redis, }),
            });
            console.log("Data successfully saved to Redis");
          } catch (redisError) {
            console.error("Error saving data to Redis:", redisError);
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
    fetchPage();
  }, []);

  useEffect(() => {
    console.log(results);
  }, [results]);

  useEffect(() => {
    console.log(albumResults);
  }, [albumResults]);

  return (
    <>
      <Link to="/" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Home</Link>
      <br></br>
      <br></br>
      {results != null && albumResults != null ?
        (<>
          <h1 className="text-8xl font-bold underline">{results.name}</h1>
          <br />
          <Avatar
            alt="Artist avatar"
            src={results.images[0].url}
            sx={{ width: 250, height: 250, justifyContent: "center", display: "flex", margin: "auto" }}
          />
          <br />
          <Divider textAlign="center" ><Chip label="Info" size="medium" /></Divider>
          <br />
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
                  <p className="font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5">
                    <GroupsIcon /> Spotify Followers: {results.followers.total}
                  </p>
                </p>
                <p>
                  <p className="bg-yellow-200 text-black border-pink-600 border-2 rounded px-2 py-2 p-2 m-4">
                    <LibraryMusicIcon /> Main Genre: {results.genres[0]}
                  </p>
                </p>
                <Link
                  to={results?.external_urls?.spotify || "#"}
                  target="_blank"
                  className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                >
                  <LaunchIcon /> {results.name}'s Spotify
                </Link>
              </Typography>
            </CardContent>
          </Card>
          <br />
          <Divider textAlign="center" ><Chip label="Top Albums" size="medium" /></Divider>
          <br />
          <Grid
            container
            spacing={2}
            sx={{
              flexGrow: 1,
              flexDirection: 'row'
            }}
          >
            {albumResults[0] ? <Card
              variant="outlined"
              sx={{
                maxWidth: 250,
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
              <CardMedia
                sx={{ height: 250, width: 250 }}
                component="img"
                image={albumResults[0].image}
                title="first album"
              />
              <CardHeader
                title={albumResults[0].name || "unknown name"}
                sx={{
                  borderBottom: "1px solid #1e8678",
                  fontWeight: "bold",
                  fontFamily: "system-ui"
                }}
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
                  <p className="font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5">
                    Artists:
                  </p>
                  {albumResults[0].artists.map((artist: any) => (
                    <p className="bg-yellow-200 text-black border-pink-600 border-2 rounded px-2 py-2 p-2 m-4">{artist}</p>
                  ))}
                  <p>
                  </p>
                  <Link
                    to={albumResults[0].platformURL}
                    target="_blank"
                    className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                  >
                    Album Link
                  </Link>
                </Typography>
              </CardContent>
            </Card> : ""}
            {albumResults[1] ? <Card
              variant="outlined"
              sx={{
                maxWidth: 250,
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
              <CardMedia
                sx={{ height: 250, width: 250 }}
                component="img"
                image={albumResults[1].image}
                title="first album"
              />
              <CardHeader
                title={albumResults[1].name || "unknown name"}
                sx={{
                  borderBottom: "1px solid #1e8678",
                  fontWeight: "bold",
                  fontFamily: "system-ui"
                }}
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
                  <p className="font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5">
                    Artists:
                  </p>
                  {albumResults[1].artists.map((artist: any) => (
                    <p className="bg-yellow-200 text-black border-pink-600 border-2 rounded px-2 py-2 p-2 m-4">{artist}</p>
                  ))}
                  <p>
                  </p>
                  <Link
                    to={albumResults[1].platformURL}
                    target="_blank"
                    className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                  >
                    Album Link
                  </Link>
                </Typography>
              </CardContent>
            </Card> : ""}
            {albumResults[2] ? <Card
              variant="outlined"
              sx={{
                maxWidth: 250,
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
              <CardMedia
                sx={{ height: 250, width: 250 }}
                component="img"
                image={albumResults[2].image}
                title="first album"
              />
              <CardHeader
                title={albumResults[2].name || "unknown name"}
                sx={{
                  borderBottom: "1px solid #1e8678",
                  fontWeight: "bold",
                  fontFamily: "system-ui"
                }}
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
                  <p className="font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5">
                    Artists:
                  </p>
                  {albumResults[2].artists.map((artist: any) => (
                    <p className="bg-yellow-200 text-black border-pink-600 border-2 rounded px-2 py-2 p-2 m-4">{artist}</p>
                  ))}
                  <p>
                  </p>
                  <Link
                    to={albumResults[2].platformURL}
                    target="_blank"
                    className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                  >
                    Album Link
                  </Link>
                </Typography>
              </CardContent>
            </Card> : ""}
            {albumResults[3] ? <Card
              variant="outlined"
              sx={{
                maxWidth: 250,
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
              <CardMedia
                sx={{ height: 250, width: 250 }}
                component="img"
                image={albumResults[3].image}
                title="first album"
              />
              <CardHeader
                title={albumResults[3].name || "unknown name"}
                sx={{
                  borderBottom: "1px solid #1e8678",
                  fontWeight: "bold",
                  fontFamily: "system-ui"
                }}
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
                  <p className="font-sans bg-[#b3f8b1] border-pink-600 border-2 rounded px-2 py-2 text-black p-2.5 m-2.5">
                    Artists:
                  </p>
                  {albumResults[3].artists.map((artist: any) => (
                    <p className="bg-yellow-200 text-black border-pink-600 border-2 rounded px-2 py-2 p-2 m-4">{artist}</p>
                  ))}
                  <p>
                  </p>
                  <Link
                    to={albumResults[3].platformURL}
                    target="_blank"
                    className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold border-black border-2 rounded hover:bg-pink-400 transition m-3"
                  >
                    Album Link
                  </Link>
                </Typography>
              </CardContent>
            </Card> : ""}
          </Grid>
        </>
        )
        : ""}
      <br />
      <br />    </>
  );
}
