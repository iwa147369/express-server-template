
// Convert a string to title case
const toTitleCase = (str) => {
    return str.toLowerCase().replace(/(?:^|\s|-)\w/g, (match) => {
      return match.toUpperCase();
    });
  };
  
  module.exports = {
    toTitleCase
  };
  