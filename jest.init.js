const { resolve } = require("path");

const testRootDir = resolve(__dirname, "./tests/");

global.testRootDir = testRootDir;
