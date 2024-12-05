import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import TierItem from "./TierItem";

interface TierItemProps {
  id: string;
  imageUrl?: string;
  altText: string;
}

interface TierBaseProps {
  items: TierItemProps[];
}

function TierBase(props: TierBaseProps) {
  const [items, setItems] = useState(props.items);

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(source.index, 1);
    reorderedItems.splice(destination.index, 0, removed);

    setItems(reorderedItems);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", 
        border: "2px solid #ccc", 
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        overflow: "hidden", 
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                display: "flex",
                flexWrap: "wrap", 
                gap: "10px", 
                padding: "10px",
                justifyContent: "left", 
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
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "60px", 
                        height: "60px", 
                        borderRadius: "8px",
                        margin: "0 5px", 
                        boxSizing: "border-box",
                        cursor: "grab",
                      }}
                    >
                      <TierItem
                        id={item.id}
                        imageUrl={item.imageUrl || ""}
                        altText={item.altText || "No description"}
                        index={index}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TierBase;
