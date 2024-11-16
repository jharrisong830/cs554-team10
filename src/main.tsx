import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { getAuthorizationURL, getPKCECodes } from "./lib/spotify/data.ts";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/auth",
        loader: async () => {
            const { codeVerifier, hashed, codeChallenge } =
                await getPKCECodes();
            const url = getAuthorizationURL(codeChallenge);
        }
    },
    {
        path: "/auth/success",
        loader: async ({ request }) => {
            return request;
        }
    }
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
