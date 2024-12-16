import { useLocation } from "react-router-dom";
import BattleComponent from "./Ranker";

const RankerPage = () => {
    const location = useLocation();
    const { songDataToSort } = location.state || {};

    return (
        <div className="p-6 font-spotify">
            <h1 className="text-4xl font-bold text-center text-black mb-6">
                Ranker Page
            </h1>
            {songDataToSort ? (
                <BattleComponent songDataToSort={songDataToSort} />
            ) : (
                <p className="text-center text-gray-500">No data to sort</p>
            )}
        </div>
    );
};

export default RankerPage;
