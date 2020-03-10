import { transform, TransformOptions } from "@babel/core";
import Plugin from "../src/index";
import * as path from "path";
//  转换代码测试

function testWithImport(
  source: string,
  output: string,
  transformerOpts: TransformOptions
) {
  const code = `import something from "${source}";`;
  const result = transform(code, transformerOpts);

  expect(result.code).toBe(
    `import something from "${path.join(testRootDir, output)}";`
  );
}

function testWithRequire(
  source: string,
  output: string,
  transformerOpts: TransformOptions
) {
  const code = `const something = require("${source}")`;
  const result = transform(code, transformerOpts);

  expect(result.code).toBe(
    `const something = require("${path.join(testRootDir, output)}");`
  );
}

function testWithExportImport(
  source: string,
  output: string,
  transformerOpts: TransformOptions
) {
  const code = `export {} from "${source}"`;
  const result = transform(code, transformerOpts);
  expect(result.code).toBe(
    `export {} from "${path.join(testRootDir, output)}";`
  );
}

describe("单一项目内转换", () => {
  const transformerOpts = {
    babelrc: false,
    plugins: [
      [
        Plugin,
        {
          isTypescript: true,
          modules: [path.resolve(__dirname, "./exampleProject1/")]
        }
      ]
    ]
  };

  const opts = {
    ...transformerOpts,
    filename: path.resolve(__dirname, "./exampleProject1/src/index.ts")
  };
  test("require导入  const x = require(`${importPath}`)", () => {
    testWithRequire(
      "@src/configs/config",
      "exampleProject1/src/configs/config",
      opts
    );

    testWithRequire("config", "exampleProject1/src/configs/config.ts", opts);
  });

  test("import导入 import xx from `${importPath}`", () => {
    testWithImport(
      "@src/configs/config",
      "exampleProject1/src/configs/config",
      opts
    );

    testWithImport("config", "exampleProject1/src/configs/config.ts", opts);
  });

  test("命名导出  export xx from `${importPath}`", () => {
    testWithExportImport(
      "@src/configs/config",
      "exampleProject1/src/configs/config",
      opts
    );

    testWithExportImport(
      "config",
      "exampleProject1/src/configs/config.ts",
      opts
    );
  });
});

describe("跨项目代码引入，项目之间路径缩写key 冲突的情况", () => {
  test("require导入  const x = require(`${importPath}`)", () => {
    const code = `const x = require('')`;
  });

  test("import导入 import xx from `${importPath}`", () => {
    const code = `import A from '@src/configs/config'`;
    // tsconfig.json 项目目录为exampleProject1

    //expect()
  });

  test("命名导出  export xx from `${importPath}`", () => {});
});
