import { useEffect, useRef, useState } from "react";
import "./App.css";
import Results from "./Results";

const BattleComponent = ({ characterDataToSort }: { characterDataToSort: string[] }) => {
    const [battleNumber, setBattleNumber] = useState(1);
    const [progress, setProgress] = useState(0);
    const [choices, setChoices] = useState("");
    const [loading, setLoading] = useState(true);
    const [leftChar, setLeftChar] = useState("");
    const [rightChar, setRightChar] = useState("");

    const sortedIndexList = useRef<number[][]>([]);
    const recordDataList = useRef<number[]>([]);
    const parentIndexList = useRef<number[]>([]);
    const tiedDataList = useRef<number[]>([]);
    const finalCharacters = useRef<any[]>([]);
    const pointer = useRef(0);
    const sortedNo = useRef(0);
    const totalBattles = useRef(1);

    const leftIndex = useRef(0);
    const leftInnerIndex = useRef(0);
    const rightIndex = useRef(0);
    const rightInnerIndex = useRef(0);
    const [showResults, setShowResults] = useState(false);
    const history = useRef<any[]>([]);

    useEffect(() => {
        start();
    }, [characterDataToSort]);
    
    const start = async () => {
        setLoading(true);
        try {
            characterDataToSort = characterDataToSort
                .map((a) => [Math.random(), a] as [number, string])
                .sort((a, b) => a[0] - b[0])
                .map((a) => a[1]);

            recordDataList.current = characterDataToSort.map(() => 0);
            tiedDataList.current = characterDataToSort.map(() => -1);
            sortedIndexList.current = [characterDataToSort.map((_, idx) => idx)];
            parentIndexList.current = [-1];

            let marker = 1;
            for (let i = 0; i < sortedIndexList.current.length; i++) {
                if (sortedIndexList.current[i].length > 1) {
                    let parent = sortedIndexList.current[i];
                    let midpoint = Math.ceil(parent.length / 2);

                    sortedIndexList.current[marker] = parent.slice(0, midpoint);
                    totalBattles.current = totalBattles.current + (sortedIndexList.current[marker]).length;
                    parentIndexList.current[marker] = i;
                    marker++;

                    sortedIndexList.current[marker] = parent.slice(midpoint);
                    totalBattles.current = totalBattles.current + (sortedIndexList.current[marker]).length;
                    parentIndexList.current[marker] = i;
                    marker++;
                }
            }

            leftIndex.current = sortedIndexList.current.length - 2;
            rightIndex.current = sortedIndexList.current.length - 1;
            leftInnerIndex.current = 0;
            rightInnerIndex.current = 0;
            updateCharacters();
        } catch (error) {
            console.error("Error during initialization:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateCharacters = () => {
        const leftCharIndex = sortedIndexList.current[leftIndex.current][leftInnerIndex.current];
        const rightCharIndex = sortedIndexList.current[rightIndex.current][rightInnerIndex.current];

        setLeftChar(characterDataToSort[leftCharIndex]);
        setRightChar(characterDataToSort[rightCharIndex]);

        setProgress(Math.floor(sortedNo.current * 100 / totalBattles.current));
    };

    const recordData = (side: "left" | "right") => {
        if (side === "left") {
            recordDataList.current[pointer.current] = sortedIndexList.current[leftIndex.current][leftInnerIndex.current];
            leftInnerIndex.current += 1;
        } else {
            recordDataList.current[pointer.current] = sortedIndexList.current[rightIndex.current][rightInnerIndex.current];
            rightInnerIndex.current += 1;
        }
        pointer.current += 1;
        sortedNo.current += 1;
    };

    const saveCurrentStateToHistory = () => {
        history.current.push({
            battleNumber,
            progress,
            leftIndex: leftIndex.current,
            leftInnerIndex: leftInnerIndex.current,
            rightIndex: rightIndex.current,
            rightInnerIndex: rightInnerIndex.current,
            choices,
            sortedIndexList: JSON.parse(JSON.stringify(sortedIndexList.current)),
            recordDataList: [...recordDataList.current],
            parentIndexList: [...parentIndexList.current],
            tiedDataList: [...tiedDataList.current],
            pointer: pointer.current,
            sortedNo: sortedNo.current,
        });
    };

    const handleSelect = (choice: "left" | "right" | "tie") => {
        saveCurrentStateToHistory();
        switch (choice) {
            case "left":
                if (choices.length === battleNumber - 1) { setChoices(choices + '0'); }
                recordData('left');
                while (tiedDataList.current[recordDataList.current[pointer.current - 1]] != -1) {
                    recordData('left');
                }
                break;
            case "right":
                if (choices.length === battleNumber - 1) { setChoices(choices + '1'); }
                recordData('right');
                while (tiedDataList.current[recordDataList.current[pointer.current - 1]] != -1) {
                    recordData('right');
                }
                break;
            case "tie":
                if (choices.length === battleNumber - 1) { setChoices(choices + '2'); }
                recordData('left');
                while (tiedDataList.current[recordDataList.current[pointer.current - 1]] != -1) {
                    recordData('left');
                }
                tiedDataList.current[recordDataList.current[pointer.current - 1]] = sortedIndexList.current[rightIndex.current][rightInnerIndex.current];
                recordData('right');
                while (tiedDataList.current[recordDataList.current[pointer.current - 1]] != -1) {
                    recordData('right');
                }
                break;
            default:
                return;
        }
        const leftListLen = (sortedIndexList.current[leftIndex.current]).length;
        const rightListLen = (sortedIndexList.current[rightIndex.current]).length;

        if (leftInnerIndex.current < leftListLen && rightInnerIndex.current === rightListLen) {
            while (leftInnerIndex.current < leftListLen) {
                recordData('left');
            }
        } else if (leftInnerIndex.current === leftListLen && rightInnerIndex.current < rightListLen) {
            while (rightInnerIndex.current < rightListLen) {
                recordData('right');
            }
        }
        if (leftInnerIndex.current === leftListLen && rightInnerIndex.current === rightListLen) {
            for (let i = 0; i < leftListLen + rightListLen; i++) {
                sortedIndexList.current[parentIndexList.current[leftIndex.current]][i] = recordDataList.current[i];
            }
            sortedIndexList.current.pop();
            sortedIndexList.current.pop();
            leftIndex.current = leftIndex.current - 2;
            rightIndex.current = rightIndex.current - 2;
            leftInnerIndex.current = 0;
            rightInnerIndex.current = 0;

            (sortedIndexList.current).forEach((_, idx) => recordDataList.current[idx] = 0);
            pointer.current = 0;
        }
        if (leftIndex.current < 0) {
            setProgress(100);
            let rankNum = 1;
            let tiedRankNum = 1;
            const finalSortedIndexes = sortedIndexList.current[0].slice(0);
            finalCharacters.current = []
            characterDataToSort.forEach((_, idx) => {
                const characterIndex = finalSortedIndexes[idx];
                const character = characterDataToSort[characterIndex];
                finalCharacters.current.push({ rank: rankNum, name: character });

                if (idx < characterDataToSort.length - 1) {
                    if (tiedDataList.current[characterIndex] === finalSortedIndexes[idx + 1]) {
                        tiedRankNum++;
                    } else {
                        rankNum += tiedRankNum;
                        tiedRankNum = 1;
                    }
                }
            });
            console.log(finalCharacters)
            console.log("Done")
            setShowResults(true)
        } else {
            setBattleNumber(battleNumber + 1);
            updateCharacters();
        }
    };

    const handleUndo = () => {
        if (history.current.length === 0) return;

        const lastState = history.current.pop();

        if (lastState) {
            const {
                battleNumber: prevBattleNumber,
                progress: prevProgress,
                leftIndex: prevLeftIndex,
                leftInnerIndex: prevLeftInnerIndex,
                rightIndex: prevRightIndex,
                rightInnerIndex: prevRightInnerIndex,
                choices: prevChoices,
                sortedIndexList: prevSortedIndexList,
                recordDataList: prevRecordDataList,
                parentIndexList: prevParentIndexList,
                tiedDataList: prevTiedDataList,
                pointer: prevPointer,
                sortedNo: prevSortedNo,
            } = lastState;
            setBattleNumber(prevBattleNumber);
            setProgress(prevProgress);
            leftIndex.current = prevLeftIndex;
            leftInnerIndex.current = prevLeftInnerIndex;
            rightIndex.current = prevRightIndex;
            rightInnerIndex.current = prevRightInnerIndex;
            setChoices(prevChoices);
            sortedIndexList.current = prevSortedIndexList;
            recordDataList.current = prevRecordDataList;
            parentIndexList.current = prevParentIndexList;
            tiedDataList.current = prevTiedDataList;
            pointer.current = prevPointer;
            sortedNo.current = prevSortedNo;
            updateCharacters();
        }
    };

    const handleReset = () => {
        setBattleNumber(1);
        setProgress(0);
        setChoices("");
        setLoading(true);
        sortedIndexList.current = [];
        recordDataList.current = [];
        parentIndexList.current = [];
        tiedDataList.current = [];
        finalCharacters.current = [];
        pointer.current = 0;
        sortedNo.current = 0;
        totalBattles.current = 1;
        leftIndex.current = 0;
        leftInnerIndex.current = 0;
        rightIndex.current = 0;
        rightInnerIndex.current = 0;
        history.current = [];
        start(); // Restart with the initial character data.
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (showResults) {
        return <Results finalResults={finalCharacters.current || []} history={history.current} characterDataToSort={characterDataToSort}/>;
    }

    return (
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
            <h2>Battle No. {battleNumber}</h2>
            <div style={{ margin: "20px 0" }}>
                <div
                    style={{
                        height: "20px",
                        width: "100%",
                        backgroundColor: "#e0e0e0",
                        borderRadius: "10px",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${progress}%`,
                            backgroundColor: progress === 100 ? "#4caf50" : "#cca0e5",
                            transition: "width 0.3s ease",
                        }}
                    ></div>
                </div>
                <div style={{ marginTop: "5px", fontSize: "14px" }}>{progress}%</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                <img src={leftChar} alt="Left Album" style={{ height: "150px", width: "150px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => handleSelect("tie")} style={{ padding: "10px 20px", fontSize: "16px" }} className="click">
                        Tie
                    </button>
                    <button onClick={handleUndo} style={{ padding: "10px 20px", fontSize: "16px" }} className="click">
                        Undo
                    </button>
                    <button onClick={handleReset} style={{ padding: "10px 20px", fontSize: "16px"}} className="click">
                        Reset
                    </button>
                </div>
                <img src={rightChar} alt="Right Album" style={{ height: "150px", width: "150px" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                <button onClick={() => handleSelect("left")} style={{ padding: "10px 20px", fontSize: "16px" }} className="click">
                    {leftChar}
                </button>
                <button onClick={() => handleSelect("right")} style={{ padding: "10px 20px", fontSize: "16px" }} className="click">
                    {rightChar}
                </button>
            </div>
        </div>
    );

};

export default BattleComponent;