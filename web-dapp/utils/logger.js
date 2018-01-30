"use strict";

const logDate = new Date().toISOString();

module.exports = {
  log: (msg) => {
    console.log(logDate, msg);
  },
  error: (msg) => {
    console.error(logDate, msg);
  }
};
