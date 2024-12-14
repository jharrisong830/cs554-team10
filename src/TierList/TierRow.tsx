import { Droppable, Draggable } from "react-beautiful-dnd";
import Tier from "./Tier";
import { TierRowProps } from "../lib/spotify/types";

function TierRow({ rowId, items, color, letter }: TierRowProps) {
    return (
        <div className="flex items-center mb-2.5">
            <div
                className={`text-white p-2.5 mr-2.5 rounded font-bold`}
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
                        className="flex items-center border-2 border-gray-300 p-2.5 rounded min-h-[80px] flex-wrap gap-2 flex-1"
                    >
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="mx-2 flex flex-col items-center border border-gray-300 rounded p-2 bg-black"
                                        style={provided.draggableProps.style}
                                    >
                                        <img
                                            src={item.imageUrl}
                                            alt={item.altText}
                                            className="w-12 h-12 object-cover mb-1.5"
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
