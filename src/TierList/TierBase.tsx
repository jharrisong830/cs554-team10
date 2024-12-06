import { Droppable, Draggable } from "react-beautiful-dnd";
import TierItem from "./TierItem";

interface TierItemProps {
    id: string;
    imageUrl?: string;
    altText: string;
}

interface TierBaseProps {
    items: TierItemProps[];
}

function TierBase({ items }: TierBaseProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "2px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
            }}
        >
            <Droppable droppableId="base" direction="horizontal">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                            padding: "10px",
                        }}
                    >
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "8px",
                                            cursor: "grab",
                                        }}
                                    >
                                        <TierItem
                                            id={item.id}
                                            imageUrl={item.imageUrl || ""}
                                            altText={item.altText || "No description"} index={0} />
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

export default TierBase;
