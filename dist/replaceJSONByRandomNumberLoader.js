"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = () =>
// Return random number for hot module replacement
`module.exports = ${Math.floor(Math.random() * 10)};`;