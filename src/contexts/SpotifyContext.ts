import { createContext } from "react";
import { APIContextProps } from "../lib/spotify/types";

const SpotifyContext = createContext<APIContextProps | null>(null);

export default SpotifyContext;
