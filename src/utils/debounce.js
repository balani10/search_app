const debounce = (func, delay) => {
  let timeout;
  return (...params) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...params);
    }, delay);
  };
};

export default debounce;
