import { FormEvent, useEffect, useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import TierRow from "./TierRow";
import TierBase from "./TierBase";
import { TierBoardProps, TierItemProps, TierRowProps } from "../lib/spotify/types";

const EXPIRY_TIME_MS = 60 * 60 * 24 * 1000; // 24 Hours

// Generate a unique key for saving/loading tier lists based on the base items' names
const generateKey = (baseItems: TierItemProps[]): string => {
    const baseNames = baseItems.map(item => item.id).join("_");
    return `tier_list_${baseNames.replace(/\s+/g, "_").toLowerCase()}`;
};

const saveTierList = (items: TierItemProps[], rows: TierRowProps[], key: string) => {
    const data = {
        items,
        rows,
        timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
};

const loadTierList = (key: string): { items: TierItemProps[]; rows: TierRowProps[] } => {
    let items: TierItemProps[] = [];
    let rows: TierRowProps[] = [];
    if (typeof window === "undefined") return { items, rows }; // Ensure this runs only on the client

    const data = localStorage.getItem(key);
    if (data) {
        const { items: savedItems, rows: savedRows, timestamp } = JSON.parse(data);
        if (Date.now() - timestamp < EXPIRY_TIME_MS) {
            return { items: savedItems, rows: savedRows };
        }
    }
    return { items, rows };
};

function TierBoard({ initialRows, baseItems, title }: TierBoardProps) {
    const key = generateKey(baseItems); // Generate a unique key based on the base items

    const [rows, setRows] = useState<TierRowProps[]>(initialRows);
    const [base, setBase] = useState<TierItemProps[]>(baseItems);

    useEffect(() => {
        // Load the saved tier list when the component mounts or the base items change
        const { items: loadedItems, rows: loadedRows } = loadTierList(key);
        if (loadedItems.length > 0 || loadedRows.length > 0) {
            setBase(loadedItems);
            setRows(loadedRows);
        }
    }, [key]);

    useEffect(() => {
        // Save the tier list whenever rows or base changes
        saveTierList(base, rows, key);
    }, [rows, base, key]);

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

    const handleRemove = (id: string) => {
        const updatedRows = rows.filter((item) => item.rowId !== id);
        const filteredOutRow = rows.filter((item) => item.rowId === id);
        const itemsInRow = filteredOutRow.map((item) => item.items).flat();
        const updatedBase = [...base, ...itemsInRow];
        setRows(updatedRows);
        setBase(updatedBase);
    };
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: `2px solid ${"#ccc"}`,
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
            }}
        >
            <h1
                style={{
                    marginBottom: "20px",
                    border: `2px solid ${"#ccc"}`,
                    borderRadius: "8px",
                    padding: "10px",
                }}
            >
                {title} Album Tier List Maker
            </h1>

            <div className='card'>
                <form className='form' id='add-author' onSubmit={onSubmitRow}>
                    <button className='button add-button' type='submit'>
                        Add Row
                    </button>
                </form>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div>
                    {rows.map((row) => (
                        <div key={row.rowId}>
                            <TierRow
                                rowId={row.rowId}
                                items={row.items}
                                color={row.color}
                                letter={row.letter}
                            />
                            <button onClick={() => handleRemove(row.rowId)}>Remove</button>
                        </div>
                    ))}
                    <TierBase items={base} />
                </div>
            </DragDropContext>
        </div>
    );
}

export default TierBoard;
