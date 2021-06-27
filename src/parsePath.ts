import * as path from 'path'
import findConfig from 'find-config'
/**
 * Generate the absolute path based on the current file path and paths configuration
 */
export function parsePath(
  currentFilePath: string,
  modulePaths: (string | RegExp)[],
  isTypescript = false
) {
  let findPath: string = null
  for (let depModule of modulePaths) {
    let inPath = false
    if (typeof depModule === 'string') {
      inPath = new RegExp(depModule).test(currentFilePath)
    } else {
      inPath = depModule.test(currentFilePath)
    }
    if (!inPath) {
      continue
    }

    const res = findConfig(isTypescript ? 'tsconfig.json' : 'jsconfig.json', {
      cwd: currentFilePath,
    })

    if (res) {
      findPath = res
      break
    }
  }

  if (findPath) {
    let findPathDir = path.dirname(findPath)
    // read json config
    const depJson: {
      compilerOptions: {
        paths: { [path: string]: string[] }
        baseUrl: string
      }
    } = require(findPath)

    //  read config's paths field and baseUrl field
    if (depJson?.compilerOptions?.paths) {
      const resultPath: { [path: string]: string } = {}
      const paths = { ...depJson.compilerOptions.paths }
      const baseUrl = depJson.compilerOptions.baseUrl || '.'

      // transform path field into absolute path
      for (let [pathKey, pathValues] of Object.entries(paths)) {
        // webpack only support one key to one path
        resultPath[pathKey] = path.resolve(findPathDir, baseUrl, pathValues[0])
      }

      return resultPath
    } else {
      return {}
    }
  }
}
