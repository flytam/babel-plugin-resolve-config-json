import { transform } from "@babel/core";

//  转换代码测试

describe("单一项目内转换", () => {
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
