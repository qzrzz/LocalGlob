import fs from "node:fs"

// @ts-ignore
const globProm = fs.promises.glob

async function check() {
    if (globProm) {
        try {
            console.log("Calling fs.promises.glob...")
            // @ts-ignore
            const result = globProm("**/*.ts", { cwd: process.cwd() })
            console.log("Result type:", typeof result)
            console.log("Is Promise?", result instanceof Promise)
            console.log("Is AsyncIterator?", result && typeof result[Symbol.asyncIterator] === "function")

            if (result instanceof Promise) {
                const val = await result
                console.log("Resolved value type:", typeof val)
                console.log("Resolved value is array?", Array.isArray(val))
                if (Array.isArray(val)) console.log("Found files:", val.length)
            } else if (result && typeof result[Symbol.asyncIterator] === "function") {
                console.log("It is an AsyncIterator.")
                let count = 0
                for await (const _ of result) {
                    count++
                }
                console.log("Iterated count:", count)
            }
        } catch (e: any) {
            console.error("Error:", e)
        }
    } else {
        console.log("fs.promises.glob not found")
    }
}

check()
