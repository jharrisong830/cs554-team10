import "../App.css";
function Homepage() {
    return (
        <>
            <h1 className="text-8xl font-bold underline">Welcome to Groovy!!</h1>
            <br />
            <br />
            <h2 className="text-4xl font-bold font-italic">What is Groovy?</h2>
            <br />
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
            <hr className="border-gray-500"/>
            <br />
            <h4 className="text-4xl font-bold font-italic">The tools we used:</h4>
            <br />
            <nav>
                <a href="https://react.dev/" className="navbarButtons">React</a>
                <a href="https://developer.spotify.com/documentation/web-api" className="navbarButtons">Spotify API</a>
                <a href="https://imagemagick.org/script/index.php" className="navbarButtons">ImageMagick</a>
                <a href="https://vercel.com/" className="navbarButtons">Vercel</a>
                <a href="https://tailwindcss.com/" className="navbarButtons">Tailwind</a>
                <a href="https://www.typescriptlang.org/" className="navbarButtons">TypeScript</a>
                <a href="https://redis.io/" className="navbarButtons">Redis</a>
            </nav>
            <br />
        </>
    );
}

export default Homepage;