import React, { useState, useEffect, useRef } from 'react';
import { TierProps } from '../lib/spotify/types';

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

      let newFontSize;
      if (letterLength !== 0) {
        newFontSize = Math.min(boxWidth, boxHeight) / ((letterLength + 1) * 0.5);
      } else {
        newFontSize = 30;
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
      <div
        ref={boxRef}
        className="flex items-center justify-center w-20 h-20 border-2 font-spotify border-gray-300 rounded-md cursor-pointer text-white text-center overflow-hidden"
        style={{
          backgroundColor: color,
          fontSize: `${fontSize}px`,
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
            className="w-full h-full text-center font-spotify border-none outline-none bg-white"
            style={{
              fontSize: `${fontSize}px`,
            }}
          />
        ) : (
          <span className="w-full break-words overflow-hidden whitespace-normal">
            {letter}
          </span>
        )}
      </div>
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
        className="w-10/12 h-5 outline-none border-none cursor-pointer appearance-none"
      />
    </div>
  );
}

export default Tier;
