import { parsePath } from "../src/parsePath";
import * as path from "path";

const exampleProject1 = path.resolve(__dirname, "./exampleProject1/");
const exampleProject2 = path.resolve(__dirname, "./exampleProject2/");

// @todo
const testRootDir = path.resolve(__dirname, "./");

describe("单一项目解析", () => {
  const filePath = path.join(exampleProject1, "src", "index.ts");

  const answer = {
    "@src/*": path.join(testRootDir, "exampleProject1/src/*"),
    "@exampleProject2/*": path.join(testRootDir, "exampleProject2/src/*"),
    config: path.resolve(testRootDir, "exampleProject1/src/configs/config.ts"),
  };
  // 下面两个测试，除了 读取tsconfig/jsconfig的区别外。baseUrl也做了对比对照

  test("jsconfig.json解析，baseUrl： ./src/", () => {
    const res = parsePath(filePath, [exampleProject1], false);

    expect(res).toEqual(answer);
  });

  test("jsconfig.json解析，baseUrl： .", () => {
    const res = parsePath(filePath, [exampleProject1], true);
    expect(res).toEqual(answer);
  });
});

describe("多项目解析", () => {
  const Pj1filePath = path.join(exampleProject1, "src", "index.ts");
  const Pj2filePath = path.join(exampleProject2, "src", "index.ts");

  test("当前文件路径在exampleProject1", () => {
    const res = parsePath(
      Pj1filePath,
      [exampleProject1, exampleProject2],
      true
    );
    const answer = {
      "@src/*": path.join(testRootDir, "exampleProject1/src/*"),
      "@exampleProject2/*": path.join(testRootDir, "exampleProject2/src/*"),
      config: path.join(testRootDir, "exampleProject1/src/configs/config.ts"),
    };

    expect(res).toEqual(answer);
  });

  test("当前文件路径在exampleProject2", () => {
    const res = parsePath(
      Pj2filePath,
      [exampleProject1, exampleProject2],
      false
    );
    const answer = {
      "@src/*": path.join(testRootDir, "exampleProject2/src/*"),
      "@exampleProject1/*": path.join(testRootDir, "exampleProject1/src/*"),
      config: path.join(testRootDir, "exampleProject2/src/configs/config.ts"),
    };

    expect(res).toEqual(answer);
  });
});
