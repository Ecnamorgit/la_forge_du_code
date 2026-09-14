# pnpm audit --prod apres DEP-02 - 2026-09-14

Total : {"info":0,"low":0,"moderate":0,"high":1,"critical":0}

## deepmerge-ts

Chemins : .>@prisma/client>prisma>@prisma/config - version corrigee : >=8.0.0 - {"high":1}

- high GHSA-ggr8-5vv4-36mx DeepmergeTS has stack exhaustion when merging recursive object graphs
