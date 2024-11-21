import React, {useState} from 'react';
import axios from 'axios';

function SearchBar() {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("onSubmit works yippee :D");
  };

  return (
    <div>
      <form id='simple-form' onSubmit={handleSubmit}>
        <label>
          Search:
          <input
            id='firstName'
            name='firstName'
            type='text'
            placeholder='Search for an artist...'
          />
        </label>
        <input type='submit' value='Submit' />
      </form>
    </div>
  );
}

export default SearchBar;