import { useEffect, useRef, useState } from "react";
import "../App.css";
import Results from "./Results";
const EXPIRY_TIME_MS = 60 * 60 * 1000; // 1 hour
import { SongData, SongDataArray, CurrSortType, Artist } from "../lib/spotify/types";
const generateKey = (names: string[]): string => {
    return `results_${names.join("_")}`;
};
import { Link } from "react-router-dom";

const saveResults = (sorting: CurrSortType | null, key: string) => {
    const data = {
        sorting,
        timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
};

const loadResults = (key: string): CurrSortType | null => {
    if (typeof window === "undefined") return null; // Ensure this runs only on the client
    const data = localStorage.getItem(key);
    if (data) {
        const { sorting, timestamp } = JSON.parse(data);
        if (Date.now() - timestamp < EXPIRY_TIME_MS) {
            return sorting;
        }
    }
    return null;
};

const BattleComponent = ({ songDataToSort, currArtist }: { songDataToSort: SongDataArray, currArtist: Artist }) => {
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
    const [totalBattles, setTotalBattles] = useState(0);
    const leftIndex = useRef(0);
    const leftInnerIndex = useRef(0);
    const rightIndex = useRef(0);
    const rightInnerIndex = useRef(0);
    const [showResults, setShowResults] = useState(false);
    const [rightImage, setRightImage] = useState("");
    const [leftImage, setLeftImage] = useState("");
    const [leftAlbum, setLeftAlbum] = useState("");
    const [rightAlbum, setRightAlbum] = useState("");
    const loaded = useRef(0)
    const history = useRef<any[]>([]);
    const currSort = useRef<CurrSortType | null>();
    const key = generateKey(songDataToSort.map((song) => song.name));
    useEffect(() => {
        const savedSort = loadResults(key);
        if (savedSort) {
            currSort.current = savedSort;
        }
        start();
    }, [songDataToSort]);

    const start = async () => {
        setLoading(true);
        try {
            if (currSort.current) {
                loaded.current = 1
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
                setTotalBattles(prevTotalBattles)
                if (leftIndex.current < 0) {
                    setProgress(100);
                    let rankNum = 1;
                    let tiedRankNum = 1;
                    const finalSortedIndexes = sortedIndexList.current[0].slice(0);
                    finalSongs.current = [];
                    console.log(songDataToSort)
                    songDataToSort.forEach((_, idx) => {
                        const songIndex = finalSortedIndexes[idx];
                        const song = songDataToSort[songIndex].name;
                        const images = songDataToSort[songIndex].images
                        const id = songDataToSort[songIndex].id
                        finalSongs.current.push({ rank: rankNum, name: song, imageUrl: images[0].url, id: id });

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
                else {
                    updateSongs(prevTotalBattles);
                }
                setLoading(false);
                return;
            }
            songDataToSort = songDataToSort
                .map((a) => [Math.random(), a] as [number, SongData])
                .sort((a, b) => a[0] - b[0])
                .map((a) => a[1]);

            recordDataList.current = songDataToSort.map(() => 0);
            tiedDataList.current = songDataToSort.map(() => -1);
            sortedIndexList.current = [songDataToSort.map((_, idx) => idx)];
            parentIndexList.current = [-1];

            let marker = 1;
            let totalBattlesCurr = 0
            for (let i = 0; i < sortedIndexList.current.length; i++) {
                if (sortedIndexList.current[i].length > 1) {
                    let parent = sortedIndexList.current[i];
                    let midpoint = Math.ceil(parent.length / 2);
                    sortedIndexList.current[marker] = parent.slice(0, midpoint);
                    totalBattlesCurr =
                        totalBattlesCurr +
                        sortedIndexList.current[marker].length
                    parentIndexList.current[marker] = i;
                    marker++;

                    sortedIndexList.current[marker] = parent.slice(
                        midpoint,
                        parent.length
                    );
                    totalBattlesCurr =
                        totalBattlesCurr +
                        sortedIndexList.current[marker].length
                    parentIndexList.current[marker] = i;
                    marker++;
                }
            }
            setTotalBattles(totalBattlesCurr)

            leftIndex.current = sortedIndexList.current.length - 2;
            rightIndex.current = sortedIndexList.current.length - 1;
            leftInnerIndex.current = 0;
            rightInnerIndex.current = 0;
            console.log(totalBattlesCurr)
            updateSongs(totalBattlesCurr);
        } catch (error) {
            console.error("Error during initialization:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSongs = (total: number) => {
        const leftSongIndex =
            sortedIndexList.current[leftIndex.current][leftInnerIndex.current];
        const rightSongIndex =
            sortedIndexList.current[rightIndex.current][
            rightInnerIndex.current
            ];

        setLeftSong((songDataToSort[leftSongIndex]).name);
        setRightSong((songDataToSort[rightSongIndex]).name);
        if ((songDataToSort[leftSongIndex]).albumName) {
            setLeftAlbum((songDataToSort[leftSongIndex]).albumName);
        }
        else {
            setLeftAlbum("Single")
        }
        if ((songDataToSort[rightSongIndex]).albumName) {
            setRightAlbum((songDataToSort[rightSongIndex]).albumName);
        }
        else {
            setRightAlbum("Single")
        }
        setLeftImage(((songDataToSort[leftSongIndex]).images[0]).url);
        setRightImage(((songDataToSort[rightSongIndex]).images[0]).url);
        if (totalBattles === 0) {
            console.log(total)
            setProgress(
                Math.floor(
                    (sortedNumber.current * 100) / (total)
                )
            );
        }
        else {
            setProgress(
                Math.floor(
                    (sortedNumber.current * 100) / (totalBattles)
                )
            );
        }
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
                const song = songDataToSort[songIndex].name;
                const images = songDataToSort[songIndex].images
                const id = songDataToSort[songIndex].id
                finalSongs.current.push({ rank: rankNum, name: song, imageUrl: images[0].url, id: id });

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
            updateSongs(1);
        }
        let obj = {
            battleNumber: battleNumber + 1,
            progress: progress,
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
            totalBattles: totalBattles
        }
        console.log(progress)
        saveResults(obj, key)
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
            updateSongs(1);
        }
    };

    const handleReset = () => {
        setBattleNumber(1);
        setProgress(0);
        setChoices("");
        setLoading(true);
        saveResults(null, key)
        currSort.current = null
        sortedIndexList.current = [];
        recordDataList.current = [];
        parentIndexList.current = [];
        tiedDataList.current = [];
        finalSongs.current = [];
        pointer.current = 0;
        sortedNumber.current = 0;
        setTotalBattles(0)
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
                currArtist={currArtist}
            />
        );
    }

    return (
        <div className="text-center font-spotify">
            <h2 className="text-2xl font-bold mb-6">
                Battle No. {battleNumber}/{totalBattles} Possible Battles
                <br></br>
                {songDataToSort.length} Songs to Rank
            </h2>
            <div className="w-full max-w-md mx-auto mb-6">
                <div className="h-5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all ${progress === 100 ? "bg-green-500" : "bg-purple-300"
                            }`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="mt-2 text-sm text-gray-700">{progress}%</div>
            </div>
            <div className="flex justify-center items-stretch gap-6 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg shadow-md flex flex-col items-center justify-between w-48 min-h-[250px]">
                    <h3 className="text-lg font-semibold mb-2 text-center break-words">
                        {leftAlbum}
                    </h3>
                    <img
                        src={leftImage}
                        alt={leftSong}
                        className="h-36 w-36 object-cover rounded mb-2"
                    />
                    <p className="text-gray-700 text-center break-words mb-2">
                        {leftSong}
                    </p>
                    <button
                        onClick={() => handleSelect("left")}
                        className="px-4 py-2 w-full bg-pink-300 text-black font-semibold rounded hover:bg-pink-400 transition"
                    >
                        {leftSong}
                    </button>
                </div>
                <div className="flex flex-col gap-4 items-center justify-center">
                    <button
                        onClick={() => handleSelect("tie")}
                        className="px-4 py-2 bg-pink-300 text-black font-semibold rounded hover:bg-pink-400 transition"
                    >
                        Tie
                    </button>
                    <button
                        onClick={handleUndo}
                        className="px-4 py-2 bg-pink-300 text-black font-semibold rounded hover:bg-pink-400 transition"
                    >
                        Undo
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-pink-300 text-black font-semibold rounded hover:bg-pink-400 transition"
                    >
                        Reset
                    </button>
                </div>
                <div className="bg-green-100 p-4 rounded-lg shadow-md flex flex-col items-center justify-between w-48 min-h-[250px]">
                    <h3 className="text-lg font-semibold mb-2 text-center break-words">
                        {rightAlbum}
                    </h3>
                    <img
                        src={rightImage}
                        alt={rightSong}
                        className="h-36 w-36 object-cover rounded mb-2"
                    />
                    <p className="text-gray-700 text-center break-words mb-2">
                        {rightSong}
                    </p>
                    <button
                        onClick={() => handleSelect("right")}
                        className="px-4 py-2 w-full bg-pink-300 text-black font-semibold rounded hover:bg-pink-400 transition"
                    >
                        {rightSong}
                    </button>
                </div>
            </div>
            <Link to="/" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Home</Link>
        </div>
    );

};

export default BattleComponent;
