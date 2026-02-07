# LocalGlob

一个高性能的 Glob 库，能在 Bun 环境中自动使用原生 `Bun.Glob`，在 Node.js 环境中使用 `tinyglobby`，以实现最佳性能。

## 特性

- 🚀 **极速**: 在 Bun 环境下使用原生的 `Bun.Glob`，Node.js 环境下回退到高度优化的 `tinyglobby`。
- 📦 **简单 API**: 提供标准的 `glob` 和 `globSync` 方法。
- 🔄 **跨运行时**: 一次编写，处处运行，并针对每个运行时进行性能优化。

## 安装

```bash
npm install localglob
# 或
bun add localglob
```

## 使用方法

### 异步 (Asynchronous)

```ts
import { glob } from "localglob"

const files = await glob("**/*.ts", { cwd: "./src" })
console.log(files)
```

### 同步 (Synchronous)

```ts
import { globSync } from "localglob"

const files = globSync("**/*.ts", { cwd: "./src" })
console.log(files)
```

### 选项 (Options)

支持的选项包括：

- `cwd`: 当前工作目录。
- `absolute`: 返回绝对路径。
- `dot`: 包含点文件 (dotfiles)。
- `onlyFiles`: 仅返回文件 (默认为 `true`)。
- `followSymlinks`: 跟随符号链接。

## 许可

ISC
