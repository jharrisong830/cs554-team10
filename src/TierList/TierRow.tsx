import { Droppable, Draggable } from "react-beautiful-dnd";
import Tier from "./Tier";
import TierItem from "./TierItem";

interface TierItemProps {
  id: string;
  imageUrl?: string;
  altText: string;
}

interface TierRowProps {
  rowId: string;
  letter?: string;
  color?: string;
  items: TierItemProps[];
}

function TierRow({ rowId, letter, color, items }: TierRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "2px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
      }}
    >
      {letter && color && (
        <div>
          <Tier initialLetter={letter} initialColor={color} />
        </div>
      )}
      <Droppable droppableId={rowId} direction="horizontal">
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
    </div>
  );
}

export default TierRow;
