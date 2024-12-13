import { useLocation } from "react-router-dom";
import TierBoard from "./TierBoard";

const TierListPage = () => {
    const location = useLocation();
    const { tierItems, currArtist, row } = location.state || {}; // Retrieve the passed data

    return (
        <div>
            <h1>Tier List Page</h1>
            {tierItems ? (
                <TierBoard
                    baseItems={tierItems}
                    title={currArtist?.name ?? "Unknown"}
                    initialRows={[row]}
                />
            ) : (
                <p>No tier list data provided</p>
            )}
        </div>
    );
};

export default TierListPage;
