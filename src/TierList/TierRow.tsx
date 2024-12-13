import { Droppable, Draggable } from "react-beautiful-dnd";
import Tier from "./Tier";
import { TierRowProps } from "../lib/spotify/types";

function TierRow({ rowId, items, color, letter }: TierRowProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <div
                style={{
                    color: "white",
                    padding: "10px",
                    marginRight: "10px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                }}
            >
                {letter && color && (
                    <div>
                        <Tier initialLetter={letter} initialColor={color} />
                    </div>
                )}
            </div>
            <Droppable droppableId={rowId} direction="horizontal">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            border: "2px solid #ccc",
                            padding: "10px",
                            borderRadius: "4px",
                            minHeight: "80px",
                            flex: 1,
                        }}
                    >
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                            ...provided.draggableProps.style,
                                            margin: "0 8px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            padding: "8px",
                                            backgroundColor: "black",
                                        }}
                                    >
                                        <img
                                            src={item.imageUrl}
                                            alt={item.altText}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover",
                                                marginBottom: "5px",
                                            }}
                                        />
                                        <span>{item.altText}</span>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}

export default TierRow;
