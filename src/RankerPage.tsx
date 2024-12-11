import { useLocation } from "react-router-dom";
import BattleComponent from "./Ranker";

const RankerPage = () => {
    const location = useLocation();
    const { songDataToSort } = location.state || {};

    return (
        <div>
            <h1>Ranker Page</h1>
            {songDataToSort ? (
                <BattleComponent songDataToSort={songDataToSort} />
            ) : (
                <p>No data to sort</p>
            )}
        </div>
    );
};

export default RankerPage;
