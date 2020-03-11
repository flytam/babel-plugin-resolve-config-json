## babel-plugin-resolve-config-json

[![Build Status](https://travis-ci.com/flytam/babel-plugin-resolve-config-json.svg?branch=master)](https://travis-ci.com/flytam/babel-plugin-resolve-config-json)

> 根据 jsconfig.json/tsonfig.json 的路径映射自动转换路径，省去手动编写 `webpack` 的 `resolve.alias` 配置

#### 使用方法

> 这是一个 babel 插件

```bash
npm i -D babel-plugin-resolve-config-json
```

```js
// babel配置
// 最好放在babel插件的第一位执行，也就是plugin数组的最后一位（babel plugin执行是逆序的）
const babelOptions = {
  presets: [],
  plugins: [
    [
      require.resolve("babel-plugin-resolve-config-json"),
      {
        isTypescript: true, // true时读取tsconfig.json，false时读取jsconfig.json。默认是false
        modules: [path.resolve(__dirname, `${projectRootPath}`)] // 默认是运行终端命令的目录。可以传递接收一个路径数组，会读取路径根目录下的config.json进行配置。
      }
    ]
  ]
};
```

#### 为什么需要

通过这篇[文章](https://medium.com/@justintulk/solve-module-import-aliasing-for-webpack-jest-and-vscode-74007ce4adc9)可以知道，在 webpack 项目中，为了避免手写`../../../../`的引用方法，我们可以像文章的配置那样，配置我们的`jsconfig.json`的`compilerOptions.paths`让`vscode`去实现自动代码简单路径检索；除此之外，我们还需要配置`webpack`的`resolve.alias`告诉`webpack`如何找到打包文件

如：

```json
// jsconfig.json or tsconfig.json
{
  "compilerOptions": {
    "target": "es2017",
    "allowSyntheticDefaultImports": false,
    "baseUrl": "./",
    "paths": {
      "Config/*": ["src/config/*"],
      "Components/*": ["src/components/*"],
      "Ducks/*": ["src/ducks/*"],
      "Shared/*": ["src/shared/*"],
      "App/*": ["src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

```js
// webpack
module.resolve = {
  alias: {
    Config: path.resolve(__dirname, "..", "src", "config"),
    Components: path.resolve(__dirname, "..", "src", "components"),
    Ducks: path.resolve(__dirname, "..", "src", "ducks"),
    Shared: path.resolve(__dirname, "..", "src", "shared"),
    App: path.join(__dirname, "..", "src")
  }
};
```

**通过`babel-plugin-resolve-config-json`。你只需要配置第一步，无需`webpack`再写一份配置就可以了！**

原理上和[babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver)差不多。`babel-plugin-resolve-config-json`的作用是为了直接通过编辑器`json`配置，省去配置`webpack`的部分

（其实这个插件为了解决最蛋疼问题是。是当前项目会引用另一个项目的代码，另一个项目又配了路径映射，这个时候额外配置`modules`字段指向另一个项目就可以完美解决）

#### 可靠吗

已经在日常线上项目打包使用半年多（从 2019.9 月），稳得一 b。（如果有 bug，webpack 打包阶段会抛异常）。可参考单元测试中的样例

#### 注意

`tsconfig.json`的`compilerOptions.paths`的 value 是一个数组，会依次查找模块，该插件只处理组字的第 0 项，而不会实现编辑器对于`tsconfig`的查找过程

#### 单元测试

```bash
npm run test
```

#### TODO

直接异步导入转换`import('module').then(x => ...)`
