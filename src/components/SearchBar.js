import React, { useState } from 'react';
import getSuggestions from './getSuggestions';

const findLastWord = (text) => {
  let lastSpace = text.length;
  while(lastSpace >= 0) {
    if(text[lastSpace] === ' ') break;
    lastSpace = lastSpace - 1;
  }
  if(lastSpace === -1)
    return text;
  return text.slice(lastSpace+1, text.length);
}

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const renderSuggestions = async (text) => {
    const lastWord = findLastWord(text);
    if(!lastWord.length) {
      setSuggestions([]);
      return;
    }
    const result = await getSuggestions(lastWord);
    setSuggestions(result);
  }

  const handleChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    if(text === '') {
      setSuggestions([]);
      return;
    }
    renderSuggestions(text);
  };

  return (
    <div>
      <input
        placeholder="Search..."
        type="text"
        value={searchText}
        onChange={handleChange}
        autoComplete="off"
      />
      <h4>
        <ul>
          {suggestions.map((value) => (
            <li>{value}</li>
          ))}
        </ul>
      </h4>
    </div>
  );
};

export default SearchBar;
