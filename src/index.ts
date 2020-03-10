import * as path from "path";
import * as t from "@babel/types";
import { PluginObj, NodePath } from "@babel/core";
import { parsePath } from "./parsePath";

interface CustomParams {
  isTypescript: boolean;
  modules: string[];
}

interface Config {
  file: {
    opts: {
      filename: string;
    };
  };
  opts: CustomParams;
  currentFilePath: string;
  myPaths: { [key: string]: string };
}

const pwd = process.cwd();

module.exports = function() {
  const plugin: PluginObj<Config> = {
    visitor: {
      Program: {
        enter(_) {
          const currentFilePath = this.file?.opts?.filename;
          const isTypescript = this.opts.isTypescript || false;
          if (process.env.DEBUG_BABEL) {
            this.currentFilePath = this.file?.opts.filename;
          }

          // read from our config that dependence which modules
          // default our cmd directory
          const depModules = this.opts.modules || [pwd];

          this.myPaths = parsePath(currentFilePath, depModules, isTypescript);
        }
      },
      ImportDeclaration: {
        enter(babelPath) {
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
        enter(babelPath) {
          if (this.myPaths) {
            // export xx from `${importPath}`
            if (babelPath?.node?.source?.value) {
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
            // @ts-ignore
            const isRequire = babelPath.get("callee").node.name === "require";
            if (isRequire) {
              // const x = require(`${importPath}`)
              // @ts-ignore
              const importPath = babelPath.get("arguments")?.[0].node.value;
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
  return plugin;
};

function processImportPath(
  importPath: string,
  babelPath: NodePath,
  myPaths: Config["myPaths"]
) {
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
            this.currentFilePath,
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
