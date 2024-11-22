import "./App.css";

const Results = ({
    finalResults,
    history,
    songDataToSort
}: {
    finalResults: any[];
    history: any[];
    songDataToSort: string[];
}) => {
    if (!finalResults?.length || !history?.length || !songDataToSort?.length) {
        return <div>No data available</div>;
    }
    const listItems = finalResults.map((result) => (
        <li key={result.name}>
            {result.rank}: {result.name}
        </li>
    ));
    const allBattles = history.map((result, index) => {
        let nextBattle;
        try {
            nextBattle = history[index + 1].choices.slice(-1);
        } catch (e) {
            let leftRank;
            let rightRank;
            for (const fin of finalResults) {
                if (
                    songDataToSort[
                        result.sortedIndexList[result.leftIndex][
                            result.leftInnerIndex
                        ]
                    ] === fin.name
                ) {
                    leftRank = fin.rank;
                }
                if (
                    songDataToSort[
                        result.sortedIndexList[result.rightIndex][
                            result.rightInnerIndex
                        ]
                    ] === fin.name
                ) {
                    rightRank = fin.rank;
                }
            }
            if (leftRank < rightRank) {
                nextBattle = "0";
            } else if (leftRank > rightRank) {
                nextBattle = "1";
            } else {
                nextBattle = "2";
            }
        }
        const outcomeText =
            nextBattle === "0"
                ? `Won ${songDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]]} vs. Lost ${songDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]]}`
                : nextBattle === "1"
                  ? `Lost ${songDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]]} vs. Won ${songDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]]}`
                  : `${songDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]]} Tied vs. ${songDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]]}`;

        return (
            <li key={result.battleNumber}>
                Battle No: {result.battleNumber}
                <br />
                {outcomeText}
            </li>
        );
    });
    return (
        <div>
            <ol style={{ listStyle: "none" }}>{listItems}</ol>
            <ol style={{ listStyle: "none" }}>{allBattles}</ol>
        </div>
    );
};

export default Results;
