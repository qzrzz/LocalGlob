import { describe, it, expect, beforeAll, afterAll } from "vitest"
import * as fs from "fs"
import * as path from "path"
import { glob, globSync } from "../src/index"

const TEST_DIR = path.join(__dirname, "test-fixtures-defaults")

// Setup test files
beforeAll(() => {
    if (fs.existsSync(TEST_DIR)) {
        fs.rmSync(TEST_DIR, { recursive: true, force: true })
    }
    fs.mkdirSync(TEST_DIR, { recursive: true })

    // Regular files
    fs.writeFileSync(path.join(TEST_DIR, "file.txt"), "content")

    // Dot file
    fs.writeFileSync(path.join(TEST_DIR, ".dotfile"), "content")

    // Subdirectories
    const subdir = path.join(TEST_DIR, "subdir")
    fs.mkdirSync(subdir)
    fs.writeFileSync(path.join(subdir, "subfile.txt"), "content")

    // Symlink
    try {
        fs.symlinkSync("file.txt", path.join(TEST_DIR, "link.txt"))
    } catch (e) {
        // Ignore symlink creation failure
    }
})

afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true })
})

describe("LocalGlob Defaults & Consistency", () => {
    describe("Default Behavior", () => {
        it("should NOT match dotfiles by default", async () => {
            const files = await glob("*", { cwd: TEST_DIR })
            expect(files).not.toContain(".dotfile")
            expect(files).toContain("file.txt")
        })

        it("should NOT return absolute paths by default", async () => {
            const files = await glob("*.txt", { cwd: TEST_DIR })
            expect(path.isAbsolute(files[0])).toBe(false)
        })

        it("should only return files by default (onlyFiles: true)", async () => {
            const items = await glob("**/*", { cwd: TEST_DIR })
            expect(items).toContain("file.txt")
            expect(items).not.toContain("subdir")
        })

        it("should follow symlinks by default", async () => {
            // Only run if symlink exists
            if (fs.existsSync(path.join(TEST_DIR, "link.txt"))) {
                const files = await glob("link.txt", { cwd: TEST_DIR })
                expect(files).toContain("link.txt")
            }
        })
    })

    describe("Override Behavior", () => {
        it("should match dotfiles when dot: true", async () => {
            const files = await glob("*", { cwd: TEST_DIR, dot: true })
            expect(files).toContain(".dotfile")
        })

        it("should return absolute paths when absolute: true", async () => {
            const files = await glob("*.txt", { cwd: TEST_DIR, absolute: true })
            expect(path.isAbsolute(files[0])).toBe(true)
        })

        it("should return directories when onlyFiles: false", async () => {
            const items = await glob("**/*", { cwd: TEST_DIR, onlyFiles: false })
            expect(items).toContain("subdir")
        })
    })

    // Sync versions
    describe("Sync Default Behavior", () => {
        it("should NOT match dotfiles by default", () => {
            const files = globSync("*", { cwd: TEST_DIR })
            expect(files).not.toContain(".dotfile")
        })

        it("should only return files by default", () => {
            const items = globSync("**/*", { cwd: TEST_DIR })
            expect(items).not.toContain("subdir")
        })
    })
})
