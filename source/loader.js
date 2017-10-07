export default () => (
  // Return random number for the hot module replacement
  `module.exports = ${Math.floor(Math.random() * 10)};`
);
