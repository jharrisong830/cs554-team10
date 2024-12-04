import { Box } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

interface TierProps {
  initialLetter: string;
  initialColor: string;
}

function Tier({ initialLetter, initialColor }: TierProps) {
  const [letter, setLetter] = useState(initialLetter);
  const [color, setColor] = useState(initialColor);
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize, setFontSize] = useState(30); 

  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (boxRef.current) {
      const boxWidth = boxRef.current.offsetWidth;
      const boxHeight = boxRef.current.offsetHeight;
      const letterLength = letter.length;
      let newFontSize
      if(letterLength !== 0){
        newFontSize = Math.min(boxWidth, boxHeight) / ((letterLength + 1)*0.6);
      } 
      else{
        newFontSize = 30/0.6
      }
      setFontSize(newFontSize);
    }
  }, [letter]);

  const handleClick = () => {
    setIsEditing(true); 
  };

  const handleBlur = () => {
    setIsEditing(false); 
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLetter(event.target.value);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  return (
    <div>
      <Box
        ref={boxRef}
        sx={{
          display: 'grid',
          placeItems: 'center',
          fontSize: `${fontSize}px`,
          fontWeight: 'bold',
          width: '60px',
          height: '60px',
          backgroundColor: color,
          cursor: 'pointer',
          position: 'relative',
        }}
        onClick={handleClick}
      >
        {isEditing ? (
          <input
            type="text"
            value={letter}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              textAlign: 'center',
              fontSize: `${fontSize}px`,
              fontWeight: 'bold',
              border: 'none',
              outline: 'none',
              background: 'transparent',
            }}
          />
        ) : (
          letter
        )}
      </Box>
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
        style={{
          width: '60px', 
          height: '20px', 
          border: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

export default Tier;
