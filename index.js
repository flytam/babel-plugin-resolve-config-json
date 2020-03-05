const path = require("path");
const t = require("@babel/types");
module.exports = function(babel) {
  return {
    visitor: {
      Program: {
        enter(babelPath, state) {
          const curentFilePath = state.file.opts.filename;
          const isTypescript = this.opts.isTypescript || false;
          if (process.env.DEBUG_BABEL) {
            this.curentFilePath = state.file.opts.filename;
          }

          // read from our config that dependence which modules
          const depModules = this.opts.modules || [];

          // find if the current file is in a dependent module. Get dependent path
          const findPath = depModules.find(depModule =>
            curentFilePath.includes(depModule)
          );

          // only handle our dependence path
          if (findPath) {
            // read json config
            const depJson = require(path.resolve(
              findPath,
              isTypescript ? "./tsconfig.json" : "./jsconfig.json"
            ));

            //  read config's paths field and baseUrl field
            if (depJson.compilerOptions && depJson.compilerOptions.paths) {
              const paths = { ...depJson.compilerOptions.paths };
              const baseUrl = depJson.compilerOptions.baseUrl || ".";

              // transform path field into absolute path
              for (let [pathKey, pathValues] of Object.entries(paths)) {
                // webpack only support one key to one path
                paths[pathKey] = path.resolve(findPath, baseUrl, pathValues[0]);
              }

              this.myPaths = paths;
            }
          }
        }
      },
      ImportDeclaration: {
        enter(babelPath, state) {
          if (this.myPaths) {
            // import xx from `${importPath}`
            const importPath = babelPath.node.source.value;
            processImportPath.call(
              this,
              importPath,
              babelPath.get("source"),
              this.myPaths
            );
          }
        }
      },
      ExportNamedDeclaration: {
        enter(babelPath, state) {
          if (this.myPaths) {
            // export xx from `${importPath}`
            if (babelPath.node.source && babelPath.node.source.value) {
              const importPath = babelPath.node.source.value;
              processImportPath.call(
                this,
                importPath,
                babelPath.get("source"),
                this.myPaths
              );
            }
          }
        }
      },
      CallExpression: {
        enter(babelPath) {
          if (this.myPaths) {
            const isRequire = babelPath.get("callee").node.name === "require";
            if (isRequire) {
              // const x = require(`${importPath}`)
              const importPath =
                babelPath.get("arguments")[0] &&
                babelPath.get("arguments")[0].node.value;
              processImportPath.call(
                this,
                importPath,
                babelPath.get("arguments")[0],
                this.myPaths
              );
            }
          }
        }
      }
    }
  };
};

/**
 *
 * @param {string} importPath path dependent string
 * @param {{replaceWith:(path)=>{}}} babelPath the ast node for importPath
 * @param {{[key:string]:string}} myPaths absolute path configuration
 */
function processImportPath(importPath, babelPath, myPaths) {
  for (let [p, absolutePath] of Object.entries(myPaths)) {
    const regStrP = p.replace("*", "(.*)");
    const reg = RegExp(`^${regStrP}$`);
    if (reg.test(importPath)) {
      // hit mapping path mapping rule
      //---------
      try {
        const result = importPath.match(RegExp(regStrP));
        const catchPath = result && result[1];

        const file = catchPath
          ? absolutePath.replace("*", catchPath)
          : absolutePath;

        if (process.env.DEBUG_BABEL) {
          console.log(
            "import path：",
            importPath,
            "\t",
            "replace path：",
            file,
            "\t",
            "current file path",
            this.curentFilePath,
            "\t\n\n"
          );
        }

        babelPath.replaceWith(t.stringLiteral(file));
      } catch (e) {
        console.warn(e);
      }
    }
  }
}
