import { toPng } from "html-to-image";
import { Artist, SongDataArray } from "../lib/spotify/types";
import { useState } from "react";
import { Link } from "react-router-dom";

const Results = ({
  finalResults,
  history,
  songDataToSort,
  currArtist
}: {
  finalResults: any[];
  history: any[];
  songDataToSort: SongDataArray;
  currArtist: Artist
}) => {
  const [caption, setCaption] = useState("");
  const handleExport = async () => {
    const node = document.getElementById("results-container");
    if (node) {
      try {
        const imageData = await toPng(node);
        const base64Image = imageData.split(",")[1];
        const response = await fetch("/api/process-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image, caption: caption }),
        });

        const data = await response.json();
        if (data.image) {
          const link = document.createElement("a");
          link.download = "processed-results.jpg";
          link.href = `data:image/jpeg;base64,${data.image}`;
          link.click();
        }
      } catch (error) {
        console.error("Error exporting image:", error);
      }
    }
  };

  if (!finalResults?.length || !history?.length || !songDataToSort?.length) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  const listItems = finalResults.map((result) => (
    <li
      key={result.id}
      className="flex items-center space-x-4 p-4 border border-gray-300 rounded-lg hover:scale-105 hover:shadow-lg transition-transform duration-200"
    >
      <img
        src={result.imageUrl}
        alt={result.name}
        className="w-16 h-16 object-cover rounded-lg transition-transform duration-200 hover:scale-110"
      />
      <span className="text-gray-800 font-spotify">
        {result.rank}: {result.name}
      </span>
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
            result.sortedIndexList[result.leftIndex][result.leftInnerIndex]
          ].name === fin.name
        ) {
          leftRank = fin.rank;
        }
        if (
          songDataToSort[
            result.sortedIndexList[result.rightIndex][result.rightInnerIndex]
          ].name === fin.name
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

    const leftSong = songDataToSort[
      result.sortedIndexList[result.leftIndex][result.leftInnerIndex]
    ];
    const rightSong = songDataToSort[
      result.sortedIndexList[result.rightIndex][result.rightInnerIndex]
    ];

    const leftClass =
      nextBattle === "0"
        ? "bg-green-100 text-green-700"
        : nextBattle === "1"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

    const rightClass =
      nextBattle === "1"
        ? "bg-green-100 text-green-700"
        : nextBattle === "0"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

    return (
      <li
        key={result.battleNumber}
        className="p-4 border border-gray-300 rounded-lg hover:scale-105 hover:shadow-lg transition-transform duration-200"
      >
        <span className="font-semibold font-spotify text-lg">
          Battle No: {result.battleNumber}
        </span>
        <br />
        <div className="mt-2 flex flex-col gap-2">
          <span
            className={`p-2 rounded-lg ${leftClass}`}
          >
            {leftSong.name}
          </span>
          <span
            className={`p-2 rounded-lg ${rightClass}`}
          >
            {rightSong.name}
          </span>
        </div>
      </li>
    );
  });

  return (
    <div className="p-6">
      <div
        id="results-container"
        className="p-4 bg-gray-50 border border-gray-200 rounded shadow-sm"
      >
        <ol className="list-none space-y-4">{currArtist.name}</ol>
        <ol className="list-none space-y-4">{listItems}</ol>
        <ol className="list-none space-y-4 mt-6">{allBattles}</ol>
      </div>
      <button
        onClick={handleExport}
        className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3"
      >
        Save Results as Image
      </button>
      <br></br>
      <input
        type="text"
        id="caption-input"
        placeholder="Enter your caption here"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3"
      />
      <br/>
      <br/>
      <Link to="/" className="mt-4 px-4 py-2 bg-pink-300 text-black font-spotify font-semibold rounded hover:bg-pink-400 transition m-3">Home</Link>
    </div>
  );
};

export default Results;
