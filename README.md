# Groovy - Spotify Battle Ranker

**Group**: Team 10 (in reference to the [late 2010's content creator group](https://en.wikipedia.org/wiki/Jake_Paul#2017%E2%80%932019:_Music,_business,_and_Team_10) by the same name)

**[Source Code](https://github.com/jharrisong830/cs554-team10)**: https://github.com/jharrisong830/cs554-team10

**[Deployment](https://cs554-team10.vercel.app)**: https://cs554-team10.vercel.app

**Members**:
- John Graham (20006581)
- Emma Hodor (20006178)
- Matthew Angelakos (20005936)
- Todd Bechtel (20005967)
- Rebecca An (20005931)

## Project Overview

People including many in this group are obsessed with ranking literally anything. Whether it be food, athletes, or music. One way that this is frequenetly done is using what is called a battle ranker. Essentially doing this or that battles to fully sort a list based on your preferences. What our project is creating a Battle Ranker for Music. Using Spotify's API we can gather an artist(s)'s discography to rank them against each-other. Allowing our users to then fully rank it based on the user's criteria. We will allow them to then customize what they are ranking in the artists discography by filtering albums or songs.

## Getting Started

This project is [hosted on Vercel and can be viewed online](https://cs554-team10.vercel.app). This deployment is fully set up with the necessary API keys and backend servers. To run this project locally, you will need to have a Spotify Developer account and bring your own API keys. You will also need to run a Redis instance on your local machine.

### Dependencies
Make sure to have the following packages installed on your computer. For example, on macOS, run the following:

```sh
brew tap redis-stack/redis-stack
brew install git node imagemagick redis-stack
```

### Environment Variables
Create a .env.local file in the root of the project, and add the following variables:

```sh
touch .env.local

# .env.local
VITE_SPOTIFY_CLIENT_ID="spotify api client key here"
VITE_SPOTIFY_REDIRECT_URL=http://localhost:5173/auth/success # set this on local
REDIS_URL=127.0.0.1:6379 # default url for redis when running on local
```

**NOTE**: For TAs grading this project, please see `TA_README.md` for more details on how to set up the environment. Our submission will contain the necessary keys and login information.

### Starting the Project
Run the following commands in order to start the backend and frontend for the project:

```sh
redis-stack-server  # start redis
npm i               # install node dependencies
npm start           # launch backend routes
npm run dev         # start frontend application
```


## Course Technologies

We intend to use the following technologies (which we have studied this semester) throughout our project:


#### React

React will be used to compose the user interface of our application. The application will be "single-paged", with React components being used to create an interactive user interface.


#### Typescript

Typescript adds additional syntax options to Javascript to enable more robust typechecking. The Typescript compiler will "translate" our code to native Javascript, and throw compile-time errors for typing errors. Typescript will aid us in validation and preventing runtime errors.


#### Redis

Redis will be used to cache results from the Spotify API, to avoid continually making requests for frequently used data.


## Independent Technologies

Additionally, we will use the following independent technologies (not covered by our course) during development:


#### ImageMagick

ImageMagick will be used to progamatically create images of user-created matchups. These images can then be downloaded by the user and shared to social media platforms.


#### Vercel

We will use Vercel to deploy and host our application. Free-tier Vercel projects allow you to host a dynamic web application, store secrets and environment variables, and also to store a small amount of data in a relational DBMS.
