import React from 'react';
import PropTypes from 'prop-types';
import './ListItem.css';

const ListItem = ({
  value,
  handleItemClick,
  isSelected,
  highlightedText,
}) => {
  const handleClick = () => {
    handleItemClick(`${value} `);
  };
  const start = value.search(highlightedText);
  const end = start + highlightedText.length;

  return (
    <li>
      <button
        className={isSelected ? 'Selected-item' : 'Item'}
        type="button"
        onClick={handleClick}
      >
        {value.slice(0, start)}
        <mark>{value.slice(start, end)}</mark>
        {value.slice(end, value.length)}
      </button>
    </li>
  );
};

ListItem.propTypes = {
  value: PropTypes.string,
  handleItemClick: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  highlightedText: PropTypes.string,
};

ListItem.defaultProps = {
  value: '',
  isSelected: false,
  highlightedText: '',
};

export default ListItem;
