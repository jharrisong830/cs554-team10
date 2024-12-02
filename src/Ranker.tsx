import { useEffect, useRef, useState } from "react";
import "./App.css";
import Results from "./Results";
const EXPIRY_TIME_MS = 60 * 60 * 1000 * 24; // 1 day
const loadCurrResults = "loadCurrent";
type CurrSortType = {
    battleNumber: number;
    progress: number;
    leftIndex: number;
    leftInnerIndex: number;
    rightIndex: number;
    rightInnerIndex: number;
    choices: string;
    sortedIndexList: number[][];
    recordDataList: number[];
    parentIndexList: number[];
    tiedDataList: number[];
    pointer: number;
    sortedNumber: number;
    history: any[]
    totalBattles: number;
};
const saveResults = (sorting: CurrSortType | null) => {
    const data = {
        sorting,
        timestamp: Date.now(),
    };
    localStorage.setItem(loadCurrResults, JSON.stringify(data));
};

const loadResults = (): CurrSortType | null => {
    const data = localStorage.getItem(loadCurrResults);
    if (data) {
        const { sorting, timestamp } = JSON.parse(data);
        if (Date.now() - timestamp < EXPIRY_TIME_MS) {
            return sorting;
        }
    }
    return null;
};

const BattleComponent = ({ songDataToSort }: { songDataToSort: string[] }) => {
    const [battleNumber, setBattleNumber] = useState(1);
    const [progress, setProgress] = useState(0);
    const [choices, setChoices] = useState("");
    const [loading, setLoading] = useState(true);
    const [leftSong, setLeftSong] = useState("");
    const [rightSong, setRightSong] = useState("");
    const sortedIndexList = useRef<number[][]>([]);
    const recordDataList = useRef<number[]>([]);
    const parentIndexList = useRef<number[]>([]);
    const tiedDataList = useRef<number[]>([]);
    const finalSongs = useRef<any[]>([]);
    const pointer = useRef(0);
    const sortedNumber = useRef(0);
    const totalBattles = useRef(0);
    const leftIndex = useRef(0);
    const leftInnerIndex = useRef(0);
    const rightIndex = useRef(0);
    const rightInnerIndex = useRef(0);
    const [showResults, setShowResults] = useState(false);
    const history = useRef<any[]>([]);
    const currSort = useRef<CurrSortType | null>(loadResults());
    useEffect(() => {
        start();
    }, [songDataToSort]);

    const start = async () => {
        setLoading(true);
        try {
            if (currSort.current) {
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
                    sortedNumber: prevSortedNo,
                    history: prevHistory,
                    totalBattles: prevTotalBattles
                } = currSort.current;
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
                sortedNumber.current = prevSortedNo;
                history.current = prevHistory
                totalBattles.current = prevTotalBattles
                if (leftIndex.current < 0) {
                    setProgress(100);
                    let rankNum = 1;
                    let tiedRankNum = 1;
                    const finalSortedIndexes = sortedIndexList.current[0].slice(0);
                    finalSongs.current = [];
                    songDataToSort.forEach((_, idx) => {
                        const songIndex = finalSortedIndexes[idx];
                        const song = songDataToSort[songIndex];
                        finalSongs.current.push({ rank: rankNum, name: song });
        
                        if (idx < songDataToSort.length - 1) {
                            if (
                                tiedDataList.current[songIndex] ===
                                finalSortedIndexes[idx + 1]
                            ) {
                                tiedRankNum++;
                            } else {
                                rankNum += tiedRankNum;
                                tiedRankNum = 1;
                            }
                        }
                    });
                    console.log(finalSongs);
                    console.log("Done");
                    setShowResults(true);
                }
                else{
                    updateSongs();
                }
                setLoading(false);
                return;
            }
            songDataToSort = songDataToSort
                .map((a) => [Math.random(), a] as [number, string])
                .sort((a, b) => a[0] - b[0])
                .map((a) => a[1]);

            recordDataList.current = songDataToSort.map(() => 0);
            tiedDataList.current = songDataToSort.map(() => -1);
            sortedIndexList.current = [songDataToSort.map((_, idx) => idx)];
            parentIndexList.current = [-1];

            let marker = 1;
            for (let i = 0; i < sortedIndexList.current.length; i++) {
                if (sortedIndexList.current[i].length > 1) {
                    let parent = sortedIndexList.current[i];
                    let midpoint = Math.ceil(parent.length / 2);

                    sortedIndexList.current[marker] = parent.slice(0, midpoint);
                    totalBattles.current =
                        totalBattles.current +
                        sortedIndexList.current[marker].length;
                    parentIndexList.current[marker] = i;
                    marker++;

                    sortedIndexList.current[marker] = parent.slice(
                        midpoint,
                        parent.length
                    );
                    totalBattles.current =
                        totalBattles.current +
                        sortedIndexList.current[marker].length;
                    parentIndexList.current[marker] = i;
                    marker++;
                }
            }

            leftIndex.current = sortedIndexList.current.length - 2;
            rightIndex.current = sortedIndexList.current.length - 1;
            leftInnerIndex.current = 0;
            rightInnerIndex.current = 0;
            updateSongs();
        } catch (error) {
            console.error("Error during initialization:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSongs = () => {
        const leftSongIndex =
            sortedIndexList.current[leftIndex.current][leftInnerIndex.current];
        const rightSongIndex =
            sortedIndexList.current[rightIndex.current][
            rightInnerIndex.current
            ];

        setLeftSong(songDataToSort[leftSongIndex]);
        setRightSong(songDataToSort[rightSongIndex]);
        setProgress(
            Math.floor(
                (sortedNumber.current * 100) / (totalBattles.current)
            )
        );
    };

    const recordData = (side: "left" | "right") => {
        if (side === "left") {
            recordDataList.current[pointer.current] =
                sortedIndexList.current[leftIndex.current][
                leftInnerIndex.current
                ];
            leftInnerIndex.current += 1;
        } else {
            recordDataList.current[pointer.current] =
                sortedIndexList.current[rightIndex.current][
                rightInnerIndex.current
                ];
            rightInnerIndex.current += 1;
        }
        pointer.current += 1;
        sortedNumber.current += 1;
    };

    const saveCurrentStateToHistory = () => {
        console.log(history)
        history.current.push({
            battleNumber,
            progress,
            leftIndex: leftIndex.current,
            leftInnerIndex: leftInnerIndex.current,
            rightIndex: rightIndex.current,
            rightInnerIndex: rightInnerIndex.current,
            choices,
            sortedIndexList: JSON.parse(
                JSON.stringify(sortedIndexList.current)
            ),
            recordDataList: [...recordDataList.current],
            parentIndexList: [...parentIndexList.current],
            tiedDataList: [...tiedDataList.current],
            pointer: pointer.current,
            sortedNumber: sortedNumber.current
        });
    };

    const handleSelect = (choice: "left" | "right" | "tie") => {
        saveCurrentStateToHistory();
        switch (choice) {
            case "left":
                if (choices.length === battleNumber - 1) {
                    setChoices(choices + "0");
                }
                recordData("left");
                while (
                    tiedDataList.current[
                    recordDataList.current[pointer.current - 1]
                    ] != -1
                ) {
                    recordData("left");
                }
                break;
            case "right":
                if (choices.length === battleNumber - 1) {
                    setChoices(choices + "1");
                }
                recordData("right");
                while (
                    tiedDataList.current[
                    recordDataList.current[pointer.current - 1]
                    ] != -1
                ) {
                    recordData("right");
                }
                break;
            case "tie":
                if (choices.length === battleNumber - 1) {
                    setChoices(choices + "2");
                }
                recordData("left");
                while (
                    tiedDataList.current[
                    recordDataList.current[pointer.current - 1]
                    ] != -1
                ) {
                    recordData("left");
                }
                tiedDataList.current[
                    recordDataList.current[pointer.current - 1]
                ] =
                    sortedIndexList.current[rightIndex.current][
                    rightInnerIndex.current
                    ];
                recordData("right");
                while (
                    tiedDataList.current[
                    recordDataList.current[pointer.current - 1]
                    ] != -1
                ) {
                    recordData("right");
                }
                break;
            default:
                return;
        }
        const leftListLen = sortedIndexList.current[leftIndex.current].length;
        const rightListLen = sortedIndexList.current[rightIndex.current].length;

        if (
            leftInnerIndex.current < leftListLen &&
            rightInnerIndex.current === rightListLen
        ) {
            while (leftInnerIndex.current < leftListLen) {
                recordData("left");
            }
        } else if (
            leftInnerIndex.current === leftListLen &&
            rightInnerIndex.current < rightListLen
        ) {
            while (rightInnerIndex.current < rightListLen) {
                recordData("right");
            }
        }
        if (
            leftInnerIndex.current === leftListLen &&
            rightInnerIndex.current === rightListLen
        ) {
            for (let i = 0; i < leftListLen + rightListLen; i++) {
                sortedIndexList.current[
                    parentIndexList.current[leftIndex.current]
                ][i] = recordDataList.current[i];
            }
            sortedIndexList.current.pop();
            sortedIndexList.current.pop();
            leftIndex.current = leftIndex.current - 2;
            rightIndex.current = rightIndex.current - 2;
            leftInnerIndex.current = 0;
            rightInnerIndex.current = 0;

            sortedIndexList.current.forEach(
                (_: any, idx: number) => (recordDataList.current[idx] = 0)
            );
            pointer.current = 0;
        }
        if (leftIndex.current < 0) {
            setProgress(100);
            let rankNum = 1;
            let tiedRankNum = 1;
            const finalSortedIndexes = sortedIndexList.current[0].slice(0);
            finalSongs.current = [];
            songDataToSort.forEach((_, idx) => {
                const songIndex = finalSortedIndexes[idx];
                const song = songDataToSort[songIndex];
                finalSongs.current.push({ rank: rankNum, name: song });

                if (idx < songDataToSort.length - 1) {
                    if (
                        tiedDataList.current[songIndex] ===
                        finalSortedIndexes[idx + 1]
                    ) {
                        tiedRankNum++;
                    } else {
                        rankNum += tiedRankNum;
                        tiedRankNum = 1;
                    }
                }
            });
            console.log(finalSongs);
            console.log("Done");
            setShowResults(true);
        } else {
            setBattleNumber(battleNumber + 1);
            updateSongs();
        }
        let obj = {
            battleNumber: battleNumber+1,
            progress,
            leftIndex: leftIndex.current,
            leftInnerIndex: leftInnerIndex.current,
            rightIndex: rightIndex.current,
            rightInnerIndex: rightInnerIndex.current,
            choices,
            sortedIndexList: JSON.parse(
                JSON.stringify(sortedIndexList.current)
            ),
            recordDataList: [...recordDataList.current],
            parentIndexList: [...parentIndexList.current],
            tiedDataList: [...tiedDataList.current],
            pointer: pointer.current,
            sortedNumber: sortedNumber.current,
            history: history.current,
            totalBattles: totalBattles.current
        }
        saveResults(obj)
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
                sortedNumber: prevSortedNo
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
            sortedNumber.current = prevSortedNo;
            updateSongs();
        }
    };

    const handleReset = () => {
        setBattleNumber(1);
        setProgress(0);
        setChoices("");
        setLoading(true);
        saveResults(null)
        currSort.current = null
        sortedIndexList.current = [];
        recordDataList.current = [];
        parentIndexList.current = [];
        tiedDataList.current = [];
        finalSongs.current = [];
        pointer.current = 0;
        sortedNumber.current = 0;
        totalBattles.current = 0;
        leftIndex.current = 0;
        leftInnerIndex.current = 0;
        rightIndex.current = 0;
        rightInnerIndex.current = 0;
        history.current = [];
        start(); // Restart with the initial song data.
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (showResults) {
        return (
            <Results
                finalResults={finalSongs.current || []}
                history={history.current}
                songDataToSort={songDataToSort}
            />
        );
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
                        position: "relative"
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: `${progress}%`,
                            backgroundColor:
                                progress === 100 ? "#4caf50" : "#cca0e5",
                            transition: "width 0.3s ease"
                        }}
                    ></div>
                </div>
                <div style={{ marginTop: "5px", fontSize: "14px" }}>
                    {progress}%
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    margin: "20px 0"
                }}
            >
                <img
                    src={leftSong}
                    alt="Left Album"
                    style={{ height: "150px", width: "150px" }}
                />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}
                >
                    <button
                        onClick={() => handleSelect("tie")}
                        style={{ padding: "10px 20px", fontSize: "16px" }}
                        className="click"
                    >
                        Tie
                    </button>
                    <button
                        onClick={handleUndo}
                        style={{ padding: "10px 20px", fontSize: "16px" }}
                        className="click"
                    >
                        Undo
                    </button>
                    <button
                        onClick={handleReset}
                        style={{ padding: "10px 20px", fontSize: "16px" }}
                        className="click"
                    >
                        Reset
                    </button>
                </div>
                <img
                    src={rightSong}
                    alt="Right Album"
                    style={{ height: "150px", width: "150px" }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "20px"
                }}
            >
                <button
                    onClick={() => handleSelect("left")}
                    style={{ padding: "10px 20px", fontSize: "16px" }}
                    className="click"
                >
                    {leftSong}
                </button>
                <button
                    onClick={() => handleSelect("right")}
                    style={{ padding: "10px 20px", fontSize: "16px" }}
                    className="click"
                >
                    {rightSong}
                </button>
            </div>
        </div>
    );
};

export default BattleComponent;
