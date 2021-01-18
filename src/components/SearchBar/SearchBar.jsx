import React, { useState, useRef, useCallback } from 'react';
import getSuggestions from '../../api/getSuggestions';
import ListItem from '../ListItem/ListItem';
import './SearchBar.css';
import keys from '../../constants/keys';
import errorTexts from '../../constants/errorTexts';
import regex from '../../constants/regex';
import debounce from '../../utils/debounce';
import findLastSpace from '../../utils/stringOperations';

const SearchBar = () => {
  const [searchText, setSearchText] = useState(''); // actual text in input
  const [suggestions, setSuggestions] = useState([]); // array of suggestions
  const [showSuggestions, setShowSuggestions] = useState(false); // flag to show/hide suggestions
  const [selectedSuggestion, setSelectedSuggestion] = useState(0); // on up/down arrow and space key
  const [highlightedText, setHighlightedText] = useState(''); // actual word to be searched
  const [error, setError] = useState('');
  const searchRef = useRef();

  const renderSuggestions = (input) => {
    if (input[input.length - 1] === ' ') return;
    const text = input.trim();
    const lastSpace = findLastSpace(text);
    let lastWord = '';
    // in case no spaces (a single word)
    if (lastSpace === -1) lastWord = text;
    else lastWord = text.slice(lastSpace + 1, text.length);
    setHighlightedText(lastWord);
    if (!lastWord.length) { // if no text in searchbar
      setSuggestions([]);
      return;
    }
    getSuggestions(lastWord) // firing the get suggestions query
      .then((result) => {
        setSuggestions(result);
        setSelectedSuggestion(0);
      })
      .catch(() => {
        setError(errorTexts.FETCH_ERROR); // done need to change
        setSuggestions([]);
        setSelectedSuggestion(0);
      });
  };
  const debouncedRenderSuggestions = useCallback(
    debounce((text) => renderSuggestions(text), 500), [],
  ); // done useCallBack

  const handleChange = (e) => {
    if (error.length) setError('');
    const text = e.target.value;
    if (regex.SEARCH_TEXT_REGEX.test(text)) {
      setError(errorTexts.INCORRECT_INPUT);
      e.preventDefault();
      return;
    }
    setSearchText(text);
    if (!text.length || text[text.length - 1] === ' ') {
      setSelectedSuggestion(0);
      setSuggestions([]);
    }
    debouncedRenderSuggestions(text);
  };

  const handleSuggestionClick = (suggestion) => { // add suggestion to input
    setSearchText((text) => {
      const lastSpace = findLastSpace(text);
      const modifiedText = (lastSpace === -1)
        ? `${suggestion}`
        : `${text.slice(0, lastSpace)} ${suggestion}`;
      setSuggestions([]);
      return modifiedText;
    });
    console.log(searchRef);
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
        if (selectedSuggestion > 0 && searchText.length > 0) {
          handleSuggestionClick(`${suggestions[selectedSuggestion - 1]} `);
        }
        break;
      default:
    }
  };

  // onFocus and onBlur event on input
  const handleFocusIn = () => {
    setShowSuggestions(true);
  };
  const handleFocusOut = (e) => {
    if (e.relatedTarget) return;
    setShowSuggestions(false);
  };

  return (
    <div className="Search-bar">
      <input
        placeholder="Search..."
        type="search"
        value={searchText}
        onChange={handleChange}
        autoComplete="off"
        ref={searchRef}
        onKeyDown={handleKeyDown}
        onBlur={handleFocusOut}
        onFocus={handleFocusIn}
        className="Search-input"
      />
      <ul className="Suggestions">
        {error.length && (
        <li className="Suggestion-error">
          {error}
        </li>
        )}
        {showSuggestions && suggestions.map((value, index) => (
          <ListItem
            key={value}
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
