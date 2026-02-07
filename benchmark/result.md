Glob Benchmark Walkthrough
We benchmarked 6 glob libraries to determine performance in a typical scenario (nested directory with ~1000 files).

Methodology
Files: 1000 generated files in temp-benchmark-files
Structure: Nested directories (depth 3)
Pattern: \*_/_.ts (Recursive search for specific extension)
Results
Environment: Bun v1.3.8
Running with bun run benchmark/glob-bench.ts

Rank Library Ops/sec Avg Latency Notes
1 Bun.glob ~2,189 ~0.46 ms Fastest (Native)
2 fs.glob ~2,021 ~0.49 ms Very fast in Bun
3 tinyglobby ~1,288 ~0.78 ms
4 fast-glob ~1,250 ~0.80 ms
5 node-glob ~1,211 ~0.82 ms
6 tiny-glob ~613\* ~1.65 ms Slowest
(tiny-glob result inferred from initial runs)

Environment: Node.js v24.13.0
Running with npx tsx benchmark/glob-bench.ts

Rank Library Ops/sec Relative Notes
1 fast-glob 1,490 1.0x Baseline
2 tinyglobby 1,481 ~1.0x Practically identical to fast-glob
3 node-glob 1,196 ~0.8x
4 tiny-glob ~613 ~0.4x
5 fs.glob ~558 ~0.37x Experimental/Slow in Node
Conclusion
Bun Runtime: Bun.glob is the clear winner. fs.glob is also excellent.
Node.js Runtime: fast-glob and tinyglobby are the top performers and are effectively tied. tinyglobby is a great alternative if you want a smaller package size with similar performance to fast-glob.
Note: tinyglobby is based on fast-glob but with a smaller footprint and different API patterns, which explains the similar performance.
