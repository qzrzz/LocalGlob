import * as tinyglobby from "tinyglobby"

const isBun = typeof Bun !== "undefined"

/**
 * Glob 选项接口
 */
export interface GlobOptions {
    /**
     * 进行文件扫描的工作目录
     * @default process.cwd()
     */
    cwd?: string

    /**
     * 是否返回绝对路径
     * @default false
     */
    absolute?: boolean

    /**
     * 是否匹配以点号开头的文件
     * @default false
     */
    dot?: boolean

    /**
     * 是否跟随符号链接
     * @default true
     */
    followSymlinks?: boolean

    /**
     * 是否仅返回文件
     *
     * - `true`: 仅返回文件 (默认)
     * - `false`: 返回文件和目录
     * @default true
     */
    onlyFiles?: boolean
}

/**
 * 异步 Glob 匹配
 * @param pattern 匹配模式或模式数组
 * @param options Glob 选项
 * @returns 匹配到的文件路径数组
 */
export async function glob(pattern: string | string[], options?: GlobOptions): Promise<string[]> {
    const opts = {
        absolute: false,
        dot: false,
        followSymlinks: true,
        onlyFiles: true,
        ...options,
    }

    if (isBun) {
        // Bun.Glob 仅支持字符串模式，不支持数组。
        // 如果传入数组，我们需要对每个模式运行 glob 并合并结果。
        if (Array.isArray(pattern)) {
            const results = await Promise.all(pattern.map((p) => glob(p, opts)))
            // 使用 Set 去重
            return Array.from(new Set(results.flat()))
        }

        const globber = new Bun.Glob(pattern)
        const results: string[] = []

        // 如果只搜索目录，必须显式将 onlyFiles 设为 false，因为 Bun 默认为 true
        if (opts.onlyFiles === false) {
            // specific logic if needed, but Bun handles onlyFiles: false (returns both)
        }

        // Bun.Glob.scan 返回一个 AsyncIterable
        for await (const result of globber.scan(opts)) {
            results.push(result)
        }
        return results
    } else {
        // 在 Node 环境中使用 tinyglobby
        const results = await tinyglobby.glob(pattern, opts)
        // tinyglobby (基于 fast-glob) 可能会在目录末尾添加斜杠，为了统一行为，我们将其移除
        // 注意：tinyglobby 中 onlyFiles: false 时也会返回目录
        return results.map((p) => (p.endsWith("/") ? p.slice(0, -1) : p))
    }
}

/**
 * 同步 Glob 匹配
 * @param pattern 匹配模式或模式数组
 * @param options Glob 选项
 * @returns 匹配到的文件路径数组
 */
export function globSync(pattern: string | string[], options?: GlobOptions): string[] {
    const opts = {
        absolute: false,
        dot: false,
        followSymlinks: true,
        onlyFiles: true,
        ...options,
    }

    if (isBun) {
        if (Array.isArray(pattern)) {
            const results = pattern.map((p) => globSync(p, opts))
            return Array.from(new Set(results.flat()))
        }

        const globber = new Bun.Glob(pattern)
        // Bun.Glob.scanSync 返回一个 Iterable
        return Array.from(globber.scanSync(opts))
    } else {
        const results = tinyglobby.globSync(pattern, opts)
        // 移除目录末尾的斜杠
        return results.map((p) => (p.endsWith("/") ? p.slice(0, -1) : p))
    }
}
