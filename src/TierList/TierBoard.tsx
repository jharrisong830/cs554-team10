import { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import TierRow from "./TierRow";

interface TierItemProps {
  id: string;
  imageUrl?: string;
  altText: string;
}

interface TierBoardProps {
  initialRows: { rowId: string; items: TierItemProps[]; color: string; letter: string }[];
}

function TierBoard({ initialRows }: TierBoardProps) {
  const [rows, setRows] = useState(initialRows);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) {
      const rowId = source.droppableId;
      const row = rows.find((row) => row.rowId === rowId);
      if (!row) return;

      const reorderedItems = Array.from(row.items);
      const [movedItem] = reorderedItems.splice(source.index, 1);
      reorderedItems.splice(destination.index, 0, movedItem);

      const updatedRows = rows.map((r) =>
        r.rowId === rowId ? { ...r, items: reorderedItems } : r
      );
      setRows(updatedRows);
    }
    else {
      const sourceRow = rows.find((row) => row.rowId === source.droppableId);
      const destinationRow = rows.find((row) => row.rowId === destination.droppableId);

      if (!sourceRow || !destinationRow) return;

      const sourceItems = Array.from(sourceRow.items);
      const destinationItems = Array.from(destinationRow.items);

      const [movedItem] = sourceItems.splice(source.index, 1);
      destinationItems.splice(destination.index, 0, movedItem);

      const updatedRows = rows.map((row) => {
        if (row.rowId === sourceRow.rowId) return { ...row, items: sourceItems };
        if (row.rowId === destinationRow.rowId) return { ...row, items: destinationItems };
        return row;
      });

      setRows(updatedRows);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        {rows.map((row) => (
          <TierRow
            key={row.rowId}
            rowId={row.rowId}
            items={row.items}
            color={row.color}
            letter={row.letter}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

export default TierBoard;
