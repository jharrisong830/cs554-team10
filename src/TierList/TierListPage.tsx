import { useLocation } from "react-router-dom";
import TierBoard from "./TierBoard";

const TierListPage = () => {
    const location = useLocation();
    const { tierItems, currArtist, rows } = location.state || {}; // Retrieve the passed data

    return (
        <div>
            {tierItems ? (
                <TierBoard
                    baseItems={tierItems}
                    title={currArtist?.name ?? "Unknown"}
                    initialRows={rows}
                />
            ) : (
                <p>No tier list data provided</p>
            )}
        </div>
    );
};

export default TierListPage;
