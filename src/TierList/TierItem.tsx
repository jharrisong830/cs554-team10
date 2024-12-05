import { Draggable } from "react-beautiful-dnd";
import { Box, Typography } from "@mui/material";

interface TierItemProps {
  id: string;
  imageUrl?: string;
  altText: string;
  index: number;
}

function TierItem({ id, imageUrl = "", altText = "No description", index }: TierItemProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, _) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "60px",
            height: "60px",
            borderRadius: "8px",
            border: "2px solid #ccc",
            backgroundColor: imageUrl ? "transparent" : "#efefef",
            boxShadow: !imageUrl ? "inset 0 0 10px rgba(0, 0, 0, 0.1)" : "none",
            overflow: "hidden",
            cursor: "grab"
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={altText}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "#333",
                textAlign: "center",
                padding: "4px",
                fontSize: "12px",
                lineHeight: "1.2",
              }}
            >
              {altText}
            </Typography>
          )}
        </Box>
      )}
    </Draggable>
  );
}

export default TierItem;
