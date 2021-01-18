import React, { useState, useRef, useCallback } from 'react';
import getSuggestions from './getSuggestions';
import ListItem from './ListItem';
import './SearchBar.css';
import keys from '../constants/keys';
import errorTexts from '../constants/errorTexts';

// function to find last space in a string
const findLastSpace = (text) => {
  let lastSpace = text.length - 1;
  while(lastSpace >= 0) {
    if(text[lastSpace] === ' ') break;
    lastSpace = lastSpace - 1;
  }
  return lastSpace;
};

// debounce function
const debounce = (func, delay) => {
  let timeout;
  return (...params) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...params);
    }, delay);
  };
};

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');   // actual text in input
  const [suggestions, setSuggestions] = useState([]);   // array of suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);  // flag to show/hide suggestions
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);  // on up/down arrow and space keys
  const [highlightedText, setHighlightedText] = useState('');   // actual word to be searched
  const [error, setError] = useState('');
  const searchRef = useRef();

  const renderSuggestions = (input) => {
    const text = input.trim();
    const lastSpace = findLastSpace(text);
    let lastWord = '';
    if(lastSpace === -1)  // in case no spaces (a single word)
      lastWord = text;
    else
      lastWord = text.slice(lastSpace+1, text.length);
    setHighlightedText(lastWord);
    if(!lastWord.length) {    // if no text in searchbar
      setSuggestions([]);
      return;
    }
    getSuggestions(lastWord)    // firing the get suggestions query
      .then((result) => {
        setSuggestions(result);
        setSelectedSuggestion(0); 
      })
      .catch((e) => {
        setError(errorTexts.FETCH_ERROR) // done need to change
      });
  };
  const debouncedRenderSuggestions = useCallback(debounce((text) => renderSuggestions(text), 500), []);  // done useCallBack

  const handleChange = (e) => {
    if(error.length) setError('');
    const text = e.target.value;
    setSearchText(text);
    if(text === '' || text[text.length - 1] === ' ') {
      setSuggestions([]);     // if empty string or space found at the end
      return;
    }
    debouncedRenderSuggestions(text);
  };

  const handleSuggestionClick = (suggestion) => {   // add suggestion to input
    setSearchText((text) => {
      const lastSpace = findLastSpace(text);
      const modifiedText = (lastSpace === -1)
        ? `${suggestion}`
        : `${text.slice(0, lastSpace)} ${suggestion}`;
      setSuggestions([]);
      return modifiedText;
    });
    searchRef.current.focus();
  };

  const handleKeyDown = (e) => {
    const suggestionsSize = suggestions.length + 1;
    switch (e.code) {
      case keys.ARROW_UP: // use constant
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev - 1 + suggestionsSize) % suggestionsSize);
        break;
      case keys.ARROW_DOWN:
        setSelectedSuggestion((prev) => (prev + 1) % suggestionsSize);
        break;
      case keys.ENTER: // check
        if(selectedSuggestion > 0) {
          handleSuggestionClick(suggestions[selectedSuggestion - 1] + ' ');
        }
        break;
      default:
    }
  };

  // onFocus and onBlur event on input
  const handleFocusIn = () => {
    setShowSuggestions(true);
  }
  const handleFocusOut = (e) => {
    if (e.relatedTarget) return;
    setShowSuggestions(false);
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
        {error.length && <li className='Suggestion-error'> {error} </li>}
        {showSuggestions && suggestions.map((value, index) => (
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
