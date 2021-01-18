import React from 'react';
import './ListItem.css';

const ListItem = ({
  value,
  handleItemClick,
  isSelected,
  highlightedText,
}) => {
  const handleClick = () => {
    handleItemClick(value + ' ');
  }
  const start = value.search(highlightedText);
  const end = start + highlightedText.length;

  return (
    <li >
      <button
        className={isSelected ? 'Selected-item' : 'Item'}
        onClick={handleClick}
      >
        {value.slice(0, start)}
        <mark>{value.slice(start, end)}</mark>
        {value.slice(end,value.length)}
      </button>
    </li>
  );
}

export default ListItem;
