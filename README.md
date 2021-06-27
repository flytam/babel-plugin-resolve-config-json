## babel-plugin-resolve-config-json

[![Build Status](https://travis-ci.com/flytam/babel-plugin-resolve-config-json.svg?branch=master)](https://travis-ci.com/flytam/babel-plugin-resolve-config-json)

[![Build Status](https://img.shields.io/npm/v/babel-plugin-resolve-config-json.svg?style=flat-square)](https://npmjs.org/package/babel-plugin-resolve-config-json)

[![npm download][download-image]][download-url]

[download-image]: https://img.shields.io/npm/dm/babel-plugin-resolve-config-json.svg?style=flat-square
[download-url]: https://npmjs.org/package/babel-plugin-resolve-config-json

> 根据 jsconfig.json/tsonfig.json 的路径映射，通过 babel 自动转换模块路径，可以省去手动编写 `webpack` 的 `resolve.alias` 配置以及解决 monorepo 中跨项目直接引用源码时多项目间的 tsconfig 的 path 的同名冲突问题

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
      require.resolve('babel-plugin-resolve-config-json'),
      {
        isTypescript: true, // true时读取tsconfig.json，false时读取jsconfig.json。默认是false
        modules: [path.resolve(__dirname, `${projectRootPath}`)], // 默认是运行终端命令的目录。可以传递接收一个路径数组（支持正则或者字符串），表示哪些路径下的文件才需要经过该插件的处理
      },
    ],
  ],
}
```

#### 为什么需要

##### 1. 解决需要额外配置一份 webpack alias 的问题

在使用 typescript 的 webpack 项目中，为了避免手写`../../../../`的引用方法，我们经常会配置`tsconfig.json`的`compilerOptions.paths`让`vscode`去实现自动代码简单路径检索。除此之外，我们还需要配置`webpack`的`resolve.alias`告诉`webpack`如何找到打包文件（目前很多脚手架如`create-react-app`其实会内置 tsconfig.json 到 webpack alias 的映射）

例如：

```json
// jsconfig.json or tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "Config/*": ["src/config/*"],
      "Components/*": ["src/components/*"],
      "Ducks/*": ["src/ducks/*"],
      "Shared/*": ["src/shared/*"],
      "App/*": ["src/*"]
    }
  }
}
```

```js
// webpack
module.resolve = {
  alias: {
    Config: path.resolve(__dirname, '..', 'src', 'config'),
    Components: path.resolve(__dirname, '..', 'src', 'components'),
    Ducks: path.resolve(__dirname, '..', 'src', 'ducks'),
    Shared: path.resolve(__dirname, '..', 'src', 'shared'),
    App: path.join(__dirname, '..', 'src'),
  },
}
```

其实上面 webpack 这段代码也可以通过一个工具函数生成

```js
// https://gist.github.com/nerdyman/2f97b24ab826623bff9202750013f99e

const { resolve } = require('path')

/**
 * Resolve tsconfig.json paths to Webpack aliases
 * @param  {string} tsconfigPath           - Path to tsconfig
 * @param  {string} webpackConfigBasePath  - Path from tsconfig to Webpack config to create absolute aliases
 * @return {object}                        - Webpack alias config
 */
function resolveTsconfigPathsToAlias({
  tsconfigPath = './tsconfig.json',
  webpackConfigBasePath = __dirname,
} = {}) {
  const { paths } = require(tsconfigPath).compilerOptions

  const aliases = {}

  Object.keys(paths).forEach((item) => {
    const key = item.replace('/*', '')
    const value = resolve(
      webpackConfigBasePath,
      paths[item][0].replace('/*', '').replace('*', '')
    )

    aliases[key] = value
  })

  return aliases
}

// webpack配置
module.exports = {
  // ...
  resolve: {
    // ...
    alias: resolveTsconfigPathsToAlias({
      tsconfigPath: '../tsconfig.json', // Using custom path
      webpackConfigBasePath: '../', // Using custom path
    }),
  },
}
```

**而通过直接使用`babel-plugin-resolve-config-json`。只需要配置 typescript 的`compilerOptions.paths`，就可以直接让 babel loader 去进行处理，无需`webpack`再写一份 alias 配置就可以实现成功打！**

原理上和[babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver)差不多。`babel-plugin-resolve-config-json`的作用是为了直接通过编辑器的`json`配置处理，省去配置`webpack`的部分

##### 2. 解决 monorepo 中跨项目直接引入源码时，不同项目都存在 tsconfig 的 paths 问题

假设在一个 monorepo 中，A 项目想直接通过直接引入源码的方式引入 B 项目中的代码，如果 B 项目用到了 tsconfig 的 paths 进行路径映射，直接这样引入 B 的代码肯定是打包失败的，因为 B 中的这个 paths 问题，A 的打包程序肯定是找不到的，这时候只需要使用本插件就可以解决这个打包问题。将 B 的路径传入 modules 的配置即可。

```js
const babelOptions = {
  presets: [],
  plugins: [
    [
      require.resolve('babel-plugin-resolve-config-json'),
      {
        isTypescript: true,
        modules: [path.resolve(__dirname, `${projectRootPath}`, 'B的路径')],
      },
    ],
  ],
}
```

#### 可靠吗

已经在日常线上项目打包使用很稳定（从 2019.9 月开始）。（如果有 bug，webpack 打包阶段会抛异常）。可参考单元测试中的样例

#### 注意

`tsconfig.json`的`compilerOptions.paths`的 value 是一个数组，会依次查找模块，该插件只处理组字的第 0 项，而不会实现编辑器对于`tsconfig`的查找过程

#### 单元测试

```bash
npm run test
```

#### 已知问题

若使用`webpack.HashedModuleIdsPlugin`。打包 hash 受到项目存放路径不同的影响，转换成绝对路径的原因会导致打包产物 hash 可能不一致。若在 CI 机器上则无问题。

TODO: 多加一步绝对路径处理成当前文件的相对路径，能一定程度改善这个问题。或不使用`webpack.HashedModuleIdsPlugin`
