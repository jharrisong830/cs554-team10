import { Draggable } from 'react-beautiful-dnd';
import { Box } from '@mui/material';

interface TierItemProps {
  id: string;          
  imageUrl?: string;    
  altText: string;      
  index: number;        
}

function TierItem({ id, imageUrl = '', altText = 'No description', index }: TierItemProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            backgroundColor: '#efefef',
            display: 'inline-block',
            overflow: 'hidden',
            boxShadow: !imageUrl ? 'inset 0 0 10px #000' : 'none',
            width: '60px',
            height: '60px',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={altText}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            altText
          )}
        </Box>
      )}
    </Draggable>
  );
}

export default TierItem;
