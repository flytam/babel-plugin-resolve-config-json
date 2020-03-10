import * as path from "path";

/**
 * Generate the absolute path based on the current file path and paths configuration
 */
export function parsePath(
  currentFilePath: string,
  modulePaths: string[],
  isTypescript = false
) {
  const findPath = modulePaths.find(depModule =>
    currentFilePath.includes(depModule)
  );
  if (findPath) {
    // read json config
    const depJson: {
      // 这个有声明文件吗...
      compilerOptions: {
        paths: { [path: string]: string[] };
        baseUrl: string;
      };
    } = require(path.resolve(
      findPath,
      isTypescript ? "./tsconfig.json" : "./jsconfig.json"
    ));

    //  read config's paths field and baseUrl field
    if (depJson?.compilerOptions?.paths) {
      const resultPath: { [path: string]: string } = {};
      const paths = { ...depJson.compilerOptions.paths };
      const baseUrl = depJson.compilerOptions.baseUrl || ".";

      // transform path field into absolute path
      for (let [pathKey, pathValues] of Object.entries(paths)) {
        // webpack only support one key to one path
        resultPath[pathKey] = path.resolve(findPath, baseUrl, pathValues[0]);
      }

      return resultPath;
    } else {
      return {};
    }
  }
}
