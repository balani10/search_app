import React, { useState, useRef } from 'react';
import getSuggestions from './getSuggestions';
import ListItem from './ListItem';
import './SearchBar.css';

// can be optimised
const findLastSpace = (text) => {
  let lastSpace = text.length - 1;
  while(lastSpace >= 0) {
    if(text[lastSpace] === ' ') break;
    lastSpace = lastSpace - 1;
  }
  return lastSpace;
}

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const searchRef = useRef();
  const [highlightedText, setHighlightedText] = useState('');

  const renderSuggestions = async (input) => {
    const text = input.trim();
    const lastSpace = findLastSpace(text);  //can be optimised
    let lastWord = '';
    if(lastSpace === -1)  //incase no spaces
      lastWord = text;
    else
      lastWord = text.slice(lastSpace+1, text.length);
    setHighlightedText(lastWord);
    if(!lastWord.length) {    //if no text in searchbar
      setSuggestions([]);
      return;
    }
    try {
      const result = await getSuggestions(lastWord);
      setSuggestions(result);
      setSelectedSuggestion(0); 
    } catch(e) {
      console.log(e);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    if(text === '' || text[text.length-1] === ' ') {
      setSuggestions([]);
      return;
    }
    renderSuggestions(text);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchText((text) => {
      const lastSpace = findLastSpace(text);  //can be optimised
      const modifiedText = (lastSpace === -1)
        ? `${suggestion}`
        : `${text.slice(0, lastSpace)} ${suggestion}`;
      setSuggestions([]);
      return modifiedText;
    });
    searchRef.current.focus();
  };

  // call only when arrowUp key. Is it possible?
  const handleKeyDown = (e) => {
    const suggestionsSize = suggestions.length + 1;
    switch (e.code) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev - 1 + suggestionsSize) % suggestionsSize);
        break;
      case 'ArrowDown':
        setSelectedSuggestion((prev) => (prev + 1) % suggestionsSize);
        break;
      case 'Space':
        if(selectedSuggestion > 0) {
          handleSuggestionClick(suggestions[selectedSuggestion - 1]);
        }
        break;
      default:
    }
  };

  // onFocus and onBlur event on input
  const handleFocusIn = () => {
    setOpen(true);
  }
  const handleFocusOut = (e) => {
    if (e.relatedTarget) return;
    setOpen(false);
  }

  return (
    <div className="Search-bar">
      <input
        placeholder="Search..."
        type="search"
        value={searchText}
        onChange={handleChange}
        autoComplete="off"
        autoFocus
        ref={searchRef}
        onKeyDown={handleKeyDown}
        onBlur={handleFocusOut}
        onFocus={handleFocusIn}
        className="Search-input"
      />
      <ul className='Suggestions'>
        {open && suggestions.map((value, index) => (
          <ListItem
            key={index}
            value={value}
            handleItemClick={handleSuggestionClick}
            isSelected={index + 1 === selectedSuggestion}
            highlightedText={highlightedText}
          />
        ))}
      </ul>
    </div>
  );
};

export default SearchBar;
