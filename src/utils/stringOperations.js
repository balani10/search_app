// function to find last space in a string
const findLastSpace = (text) => {
  let lastSpace = text.length - 1;
  while (lastSpace >= 0) {
    if (text[lastSpace] === ' ') break;
    lastSpace -= 1;
  }
  return lastSpace;
};

export default findLastSpace;
