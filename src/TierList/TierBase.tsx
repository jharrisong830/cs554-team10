import { Droppable, Draggable } from "react-beautiful-dnd";
import { TierBaseProps } from "../lib/spotify/types";

function TierBase({ items }: TierBaseProps) {
    return (
        <>
            <div className="flex flex-col items-center border-2 border-gray-300 rounded-lg p-2.5 mb-2.5 bg-white">
                <Droppable droppableId="base" direction="horizontal">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex items-center p-2.5 rounded-md min-h-[80px] flex-wrap gap-2.5 flex-1"
                        >
                            {items.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="flex flex-col items-center border border-gray-300 rounded-md p-2 bg-gray-100 text-black"
                                            style={provided.draggableProps.style}
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.altText}
                                                className="w-[50px] h-[50px] object-cover mb-1.5"
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
        </>
    );
}

export default TierBase;
