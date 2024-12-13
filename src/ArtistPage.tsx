import { useEffect, useState, } from "react";
import {
  Divider,
  Chip,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
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
          try {
            await fetch(`${API_URL}?searchTerm=${finalSearchTerm}&searchValue=${id.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: data, data2: data2 }),
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
      {results != null && albumResults != null ?
        (<>
          <h1>{results.name}</h1>
          <Avatar
            alt="Artist avatar"
            src={results.images[0].url}
            sx={{ width: 250, height: 250, justifyContent: "center", display: "flex", margin: "auto" }}
          />
          <br />
          <Divider textAlign="center" ><Chip label="Info" size="medium" /></Divider>
          <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <nav aria-label="main artist info">
              <List
                sx={{}}>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <GroupsIcon />
                  </ListItemIcon>
                  <ListItemText primary={`Spotify Followers: ${results.followers.total}`} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <LibraryMusicIcon />
                  </ListItemIcon>
                  <ListItemText primary={`Main Genre: ${results.genres[0]}`} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <LaunchIcon />
                  </ListItemIcon>
                  <a href={`${results.external_urls.spotify}`} target="_blank">Open Spotify Link</a>
                </ListItem>
              </List>
            </nav>
          </Box>
          <Divider textAlign="center" ><Chip label="Top Albums" size="medium" /></Divider>
          <br />
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} >
            <Grid size={6} display="flex">
              {albumResults[0] ? <Card>
                <CardMedia
                  sx={{ height: 140 }}
                  image={albumResults[0].image}
                  title="first album"
                />
                <CardContent>
                  <Typography variant="h5" component="div">
                    {albumResults[0].name}
                  </Typography>
                  <Typography variant="body2">
                    {albumResults[0].artists.map((artist: any) => (
                      <p>{artist}</p>
                    ))}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to={albumResults[0].platformURL} target="_blank">
                    <Button size="small">Spotify Link</Button>
                  </Link>
                </CardActions>
              </Card> : ""}
            </Grid>
            <Grid size={6} display="flex">
              {albumResults[1] ? <Card>
                <CardMedia
                  sx={{ height: 140 }}
                  image={albumResults[1].image}
                  title="first album"
                />
                <CardContent>
                  <Typography variant="h5" component="div">
                    {albumResults[1].name}
                  </Typography>
                  <Typography variant="body2">
                    {albumResults[1].artists.map((artist: any) => (
                      <p>{artist}</p>
                    ))}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to={albumResults[1].platformURL} target="_blank">
                    <Button size="small">Spotify Link</Button>
                  </Link>
                </CardActions>
              </Card> : ""}
            </Grid>
            <Grid size={6} display="flex">
              {albumResults[2] ? <Card>
                <CardMedia
                  sx={{ height: 140 }}
                  image={albumResults[2].image}
                  title="first album"
                />
                <CardContent>
                  <Typography variant="h5" component="div">
                    {albumResults[2].name}
                  </Typography>
                  <Typography variant="body2">
                    {albumResults[2].artists.map((artist: any) => (
                      <p>{artist}</p>
                    ))}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to={albumResults[2].platformURL} target="_blank">
                    <Button size="small">Spotify Link</Button>
                  </Link>
                </CardActions>
              </Card> : ""}
            </Grid>
            <Grid size={6} display="flex">
              {albumResults[3] ? <Card>
                <CardMedia
                  sx={{ height: 150, width: 150 }}
                  image={albumResults[3].image}
                  title="first album"
                />
                <CardContent>
                  <Typography variant="h5" component="div">
                    {albumResults[3].name}
                  </Typography>
                  <Typography variant="body2">
                    {albumResults[3].artists.map((artist: any) => (
                      <p>{artist}</p>
                    ))}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Link to={albumResults[3].platformURL} target="_blank">
                    <Button size="small">Spotify Link</Button>
                  </Link>
                </CardActions>
              </Card> : ""}
            </Grid>
          </Grid>
        </>
        )




        : ""}

    </>
  );
}
