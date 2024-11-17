import "./App.css";

const Results = ({ finalResults, history, characterDataToSort }: { finalResults: any[], history: any[], characterDataToSort: string[] }) => {
    const listItems = finalResults.map(result => <li>{result.rank}: {result.name}</li>);
    const allBattles = history.map((result, index) => {
        let nextBattle
        try {
            nextBattle = (history[index + 1].choices).slice(-1)
        } catch (e) {
            let leftRank
            let rightRank
            for(const fin of finalResults){
                if(characterDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]] === fin.name){
                    leftRank = fin.rank
                }
                if(characterDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]] === fin.name){
                    rightRank = fin.rank
                }
            }
            if(leftRank < rightRank){
                nextBattle = '0'
            }
            else if(leftRank > rightRank){
                nextBattle = '1'
            }
            else{
                nextBattle = '2'
            }
        }
        const outcomeText = nextBattle === '0'
            ? `Won ${characterDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]]} vs. Lost ${characterDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]]}`
            : nextBattle === '1'
                ? `Lost ${characterDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]]} vs. Won ${characterDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]]}`
                : `${characterDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]]} Tied vs. ${characterDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]]}`;

        return (
            <li>
                Battle No: {result.battleNumber}
                <br />
                {outcomeText}
            </li>
        );
    })
    return (
        <div>
            <ol style={{ listStyle: 'none' }}>
                {listItems}
            </ol>
            <ol style={{ listStyle: 'none' }}>
                {allBattles}
            </ol>
        </div>
    )
}

export default Results;