export default () => (
  // Return random number for hot module replacement
  `module.exports = ${Math.floor(Math.random() * 10)};`
);
