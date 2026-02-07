import { Bench } from "tinybench"
import fs from "node:fs"
import path from "node:path"
import tinyGlob from "tiny-glob"
import fastGlob from "fast-glob"
import { glob as tinyGlobby } from "tinyglobby"
import { glob } from "glob"
import chalk from "chalk"

// Polyfill for fs.glob if not available (shim for typing, actual runtime check below)
// Node.js 22+ has fs.glob but type definitions might need update or casting.
// we prioritize fs.promises.glob which returns AsyncIterator
// @ts-ignore
const fsGlob = fs.promises?.glob || fs.glob

const TEMP_DIR = path.resolve(process.cwd(), "temp-benchmark-files")
const FILE_COUNT = 1000
const NESTING_DEPTH = 3

// Helpers to generate files
function generateFiles() {
    if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true })
    }
    fs.mkdirSync(TEMP_DIR)

    console.log(chalk.cyan(`Generating ${FILE_COUNT} files in ${TEMP_DIR}...`))

    for (let i = 0; i < FILE_COUNT; i++) {
        const depth = i % NESTING_DEPTH
        let dir = TEMP_DIR
        for (let d = 0; d < depth; d++) {
            dir = path.join(dir, `depth_${d}`)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        }

        const ext = i % 3 === 0 ? ".ts" : i % 3 === 1 ? ".txt" : ".js"
        const filepath = path.join(dir, `file_${i}${ext}`)
        fs.writeFileSync(filepath, `Wait content for file ${i}`)
    }
    console.log(chalk.green("Files generated."))
}

function cleanup() {
    if (fs.existsSync(TEMP_DIR)) {
        console.log(chalk.yellow("Cleaning up..."))
        fs.rmSync(TEMP_DIR, { recursive: true, force: true })
    }
}

async function runBenchmark() {
    generateFiles()

    const bench = new Bench({ time: 5000 }) // longer time for stability

    // 1. tiny-glob
    bench.add("tiny-glob (**/*.ts)", async () => {
        await tinyGlob("**/*.ts", { cwd: TEMP_DIR })
    })

    // 2. fast-glob
    bench.add("fast-glob (**/*.ts)", async () => {
        await fastGlob("**/*.ts", { cwd: TEMP_DIR })
    })

    // 2.5 tinyglobby
    bench.add("tinyglobby (**/*.ts)", async () => {
        await tinyGlobby("**/*.ts", { cwd: TEMP_DIR })
    })

    // 3. glob
    bench.add("node-glob (**/*.ts)", async () => {
        await glob("**/*.ts", { cwd: TEMP_DIR })
    })

    // 4. fs.glob (Node native)
    if (typeof fsGlob === "function") {
        bench.add("fs.glob (**/*.ts)", async () => {
            // fs.promises.glob returns an AsyncIterator.
            const iterator = fsGlob("**/*.ts", { cwd: TEMP_DIR }) as AsyncIterable<string>
            // consume iterator
            // @ts-ignore
            for await (const _ of iterator) {
            }
        })
    } else {
        console.log(chalk.red("fs.glob is not available in this Node.js version."))
    }

    // 5. Bun.glob (Bun specific)
    // @ts-ignore
    if (typeof Bun !== "undefined") {
        bench.add("Bun.glob (**/*.ts)", async () => {
            // @ts-ignore
            const glob = new Bun.Glob("**/*.ts")
            // @ts-ignore
            for await (const file of glob.scan({ cwd: TEMP_DIR })) {
                // consume
            }
        })
    } else {
        console.log(chalk.yellow("Bun is not available, skipping Bun.glob"))
    }

    // --- Run ---
    console.log(chalk.blue("Running benchmark... (5s)"))
    await bench.run()

    console.table(bench.table())

    cleanup()
}

runBenchmark().catch((err) => {
    console.error(err)
    cleanup()
})
