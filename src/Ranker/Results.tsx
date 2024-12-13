import "../App.css";
import { toPng } from "html-to-image";
import { SongDataArray } from "../lib/spotify/types";

const Results = ({
  finalResults,
  history,
  songDataToSort,
}: {
  finalResults: any[];
  history: any[];
  songDataToSort: SongDataArray;
}) => {
  const handleExport = async () => {
    const node = document.getElementById("results-container");
    if (node) {
      try {
        const imageData = await toPng(node);
        const base64Image = imageData.split(",")[1]; 
        const response = await fetch("/api/process-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
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

    const outcomeText =
      nextBattle === "0"
        ? `Won ${songDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]].name} vs. Lost ${songDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]].name}`
        : nextBattle === "1"
        ? `Lost ${songDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]].name} vs. Won ${songDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]].name}`
        : `${songDataToSort[result.sortedIndexList[result.leftIndex][result.leftInnerIndex]].name} Tied vs. ${songDataToSort[result.sortedIndexList[result.rightIndex][result.rightInnerIndex]].name}`;

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
      <div id="results-container" style={{ padding: "10px" }}>
        <ol style={{ listStyle: "none" }}>{listItems}</ol>
        <ol style={{ listStyle: "none" }}>{allBattles}</ol>
      </div>
      {/* Button to export the results as an image */}
      <button onClick={handleExport}>Save Results as Image</button>
    </div>
  );
};

export default Results;
