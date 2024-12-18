import React, { useState, useEffect, useRef } from 'react';
import { TierProps } from '../lib/spotify/types';

function Tier({ initialLetter, initialColor }: TierProps) {
  const [color, setColor] = useState(initialColor);
  const [letter, setLetter] = useState(initialLetter);
  const [isEditing, setIsEditing] = useState(false);
  const [fontSize] = useState(20);
  const [height, setHeight] = useState(80);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const scrollHeight = inputRef.current.scrollHeight;
      setHeight(scrollHeight);
    }
  }, [letter]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLetter(e.target.value);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  return (
    <div>
      <div
        ref={boxRef}
        className="flex items-center justify-center min-w-[5rem] max-w-[8rem] min-h-[5rem] border-2 font-spotify border-gray-300 rounded-md cursor-pointer text-white text-center overflow-hidden break-words whitespace-normal"
        style={{
          backgroundColor: color,
          fontSize: `${fontSize}px`,
        }}
        onClick={handleClick}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={letter}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
            className="w-full h-full text-center font-spotify border-none outline-none bg-transparent resize-none overflow-hidden"
            style={{
              height: `${height}px`,
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
