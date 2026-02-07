# LocalGlob

A high-performance glob library that automatically switches between `Bun.Glob` (in Bun) and `tinyglobby` (in Node.js) for optimal speed.

## Features

- 🚀 **Fast**: Uses native `Bun.Glob` in Bun environments, falling back to the highly optimized `tinyglobby` in Node.js.
- 📦 **Simple API**: Provides standard `glob` and `globSync` methods.
- 🔄 **Cross-Runtime**: Write once, run anywhere with the best performance for each runtime.

## Installation

```bash
npm install local-glob
# or
bun add local-glob
```

## Usage

### Asynchronous

```ts
import { glob } from "local-glob"

const files = await glob("**/*.ts", { cwd: "./src" })
console.log(files)
```

### Synchronous

```ts
import { globSync } from "local-glob"

const files = globSync("**/*.ts", { cwd: "./src" })
console.log(files)
```

### Options

Supported options include:

- `cwd`: Current working directory.
- `absolute`: Return absolute paths.
- `dot`: Include dotfiles.
- `onlyFiles`: Return only files (default: `true`).
- `followSymlinks`: Follow symbolic links.

## License

ISC
