module.exports = {
  setupFilesAfterEnv: ["./jest.init.js"],
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsConfig: "./tests/tsconfig.json"
    }
  }
};
