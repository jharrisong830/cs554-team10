import { FormEvent, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import TierRow from "./TierRow";
import TierBase from "./TierBase";

interface TierItemProps {
    id: string;
    imageUrl?: string;
    altText: string;
}

interface TierBoardProps {
    initialRows: { rowId: string; items: TierItemProps[]; color: string; letter: string }[];
    baseItems: TierItemProps[];
}

function TierBoard({ initialRows, baseItems }: TierBoardProps) {
    const [rows, setRows] = useState(initialRows);
    const [base, setBase] = useState(baseItems);
    function onSubmitRow(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const lastRow = rows[rows.length - 1]; 
        const lastRowId = lastRow ? parseInt(lastRow.rowId.replace("row", "")) : 0;
        const newRowId = `row${lastRowId + 1}`;
        setRows([
            ...rows,
            {
                rowId: newRowId,
                items: [],
                letter: "Default",
                color: "#000000",
            },
        ]);
    }

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) {
            if (source.droppableId === "base") {
                const reorderedBase = Array.from(base);
                const [movedItem] = reorderedBase.splice(source.index, 1);
                reorderedBase.splice(destination.index, 0, movedItem);
                setBase(reorderedBase);
            } else {
                const row = rows.find((r) => r.rowId === source.droppableId);
                if (!row) return;
                const reorderedItems = Array.from(row.items);
                const [movedItem] = reorderedItems.splice(source.index, 1);
                reorderedItems.splice(destination.index, 0, movedItem);
                const updatedRows = rows.map((r) =>
                    r.rowId === source.droppableId ? { ...r, items: reorderedItems } : r
                );
                setRows(updatedRows);
            }
        } else {
            if (source.droppableId === "base") {
                const sourceItems = Array.from(base);
                const destinationRow = rows.find((row) => row.rowId === destination.droppableId);
                if (!destinationRow) return;
                const destinationItems = Array.from(destinationRow.items);
                const [movedItem] = sourceItems.splice(source.index, 1);
                destinationItems.splice(destination.index, 0, movedItem);

                setBase(sourceItems);
                const updatedRows = rows.map((r) =>
                    r.rowId === destination.droppableId
                        ? { ...r, items: destinationItems }
                        : r
                );
                setRows(updatedRows);
            } else if (destination.droppableId === "base") {
                const sourceRow = rows.find((row) => row.rowId === source.droppableId);

                if (!sourceRow) return;

                const sourceItems = Array.from(sourceRow.items);
                const [movedItem] = sourceItems.splice(source.index, 1);
                const updatedBase = Array.from(base);
                updatedBase.splice(destination.index, 0, movedItem);

                const updatedRows = rows.map((r) =>
                    r.rowId === source.droppableId ? { ...r, items: sourceItems } : r
                );
                setRows(updatedRows);
                setBase(updatedBase);
            } else {
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
        }
    };


    return (
        <><div className='card'>
            <form className='form' id='add-author' onSubmit={onSubmitRow}>
                <button className='button add-button' type='submit'>
                    Add Row
                </button>
            </form>
        </div><DragDropContext onDragEnd={handleDragEnd}>
                <div>
                    {rows.map((row) => (
                        <TierRow
                            key={row.rowId}
                            rowId={row.rowId}
                            items={row.items}
                            color={row.color}
                            letter={row.letter} />
                    ))}
                    <TierBase items={base} />
                </div>
            </DragDropContext></>
    );

}

export default TierBoard;
