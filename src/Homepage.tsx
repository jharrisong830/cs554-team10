import { useContext } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import SpotifyContext from "./contexts/SpotifyContext";

export default function Homepage() {
    const { stateValue } = useContext(SpotifyContext)!;
    return (
        <>
            <h1>Welcome to [unnamed battle ranker]!</h1>

            <h2>What is [unnamed battle ranker]?</h2>
            <h4>
                People are obsessed with ranking literally anything. Whether it
                be food, athletes, or music. One way that this is frequently
                done is using what is called a battle ranker. Essentially doing
                this or that battles to fully sort a list based on your
                preferences. Now we have a battle ranker for all your favorite
                artists! You can rank anyone's discography based on your
                preferences. You can customize what you're ranking in the
                artist's discography by filtering albums or songs.
            </h4>
            <br />
            <br />
            <br />
            <br />
            <h4>The tools we used:</h4>
            <ul>
                <li>React</li>
                <li>Spotify API</li>
                <li>ImageMagick</li>
                <li>Vercel</li>
            </ul>

            <div>
                {stateValue.accessToken !== null ? (
                    <Button // @ts-ignore
                        as={Link} 
                        variant="primary" 
                        to="/search"
                        className="mx-2"
                    >
                        Search
                    </Button>
                ) : (
                    <Button // @ts-ignore
                        as={Link} 
                        variant="success" 
                        to="/auth"
                        className="mx-2"
                    >
                        Log in to Spotify
                    </Button>
                )
                }
            </div>
        </>
    );
}
