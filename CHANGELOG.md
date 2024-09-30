## 1.1.6 (2024-09-29)

### 🩹 Fixes

- prevent word wrap in tree ([0130a55](https://github.com/angular-architects/forensic/commit/0130a55))

### ❤️ Thank You

- Manfred Steyer

## 1.1.5 (2024-09-29)

### 🩹 Fixes

- don't wrap tree entries ([527ed58](https://github.com/angular-architects/forensic/commit/527ed58))

### ❤️ Thank You

- Manfred Steyer

## 1.1.4 (2024-09-29)

### 🩹 Fixes

- always show resize cursor during resizing ([be5836b](https://github.com/angular-architects/forensic/commit/be5836b))

### ❤️ Thank You

- Manfred Steyer

## 1.1.3 (2024-09-28)

### 🚀 Features

- add store for limits ([2f9b490](https://github.com/angular-architects/forensic/commit/2f9b490))
- add limits store to team alignment and hotspots ([5547a7c](https://github.com/angular-architects/forensic/commit/5547a7c))
- add store to coupling feature ([28b7c31](https://github.com/angular-architects/forensic/commit/28b7c31))
- add signal store to hotspot and team alignment analysis ([fdc6882](https://github.com/angular-architects/forensic/commit/fdc6882))
- add resizer for tree ([7ef551c](https://github.com/angular-architects/forensic/commit/7ef551c))

### ❤️ Thank You

- Manfred Steyer

## 1.1.2 (2024-09-27)

### 🚀 Features

- **frontend:** show actual number of changed lines in team alignment ([955828b](https://github.com/angular-architects/forensic/commit/955828b))

### 🩹 Fixes

- **frontend:** only show one tip tool text at once ([d5dbabd](https://github.com/angular-architects/forensic/commit/d5dbabd))

### ❤️ Thank You

- Manfred Steyer

## 1.1.1 (2024-09-16)

### 🚀 Features

- support aliases for git log usernames ([5f033a7](https://github.com/angular-architects/forensic/commit/5f033a7))

### ❤️ Thank You

- John van Leeuwen

## 1.1.0 (2024-09-11)

### 🚀 Features

- allow to filter git log ([111d02a](https://github.com/angular-architects/forensic/commit/111d02a))
- add sum of coupling ([dba3f46](https://github.com/angular-architects/forensic/commit/dba3f46))
- add file filter ([26b8c66](https://github.com/angular-architects/forensic/commit/26b8c66))
- use version together with git hash as cache key ([83d45dc](https://github.com/angular-architects/forensic/commit/83d45dc))
- link readme for defining teams ([c76dcde](https://github.com/angular-architects/forensic/commit/c76dcde))

### 🩹 Fixes

- remove unneeded console logs ([9a25dcb](https://github.com/angular-architects/forensic/commit/9a25dcb))
- normalize path for hotspot analysis ([7ee2005](https://github.com/angular-architects/forensic/commit/7ee2005))

### ❤️ Thank You

- Manfred Steyer

## 1.0.3 (2024-09-09)

- update to sheriff-core 0.17.1

## 1.0.0

### 🚀 Features

- parse commandline options ([eee51b3](https://github.com/angular-architects/forensic/commit/eee51b3))
- add angular material ([7cc2873](https://github.com/angular-architects/forensic/commit/7cc2873))
- add filter ([e3f3a2e](https://github.com/angular-architects/forensic/commit/e3f3a2e))
- add graph component for coupling ([76c4c80](https://github.com/angular-architects/forensic/commit/76c4c80))
- show node details ([3b61603](https://github.com/angular-architects/forensic/commit/3b61603))
- add coherence ([b6e113e](https://github.com/angular-architects/forensic/commit/b6e113e))
- use cola simulation for graph ([1d39e93](https://github.com/angular-architects/forensic/commit/1d39e93))
- add option for showing groups ([1ed0bff](https://github.com/angular-architects/forensic/commit/1ed0bff))
- poc of new graph implementation ([e1f9a56](https://github.com/angular-architects/forensic/commit/e1f9a56))
- use cytoscape for graph ([8694539](https://github.com/angular-architects/forensic/commit/8694539))
- grouping nodes in graph ([d54cd5e](https://github.com/angular-architects/forensic/commit/d54cd5e))
- add team alignment ([a1f26c1](https://github.com/angular-architects/forensic/commit/a1f26c1))
- small improvements for v0.0.1 ([7ab78fd](https://github.com/angular-architects/forensic/commit/7ab78fd))
- add hotspot analysis ([32590d4](https://github.com/angular-architects/forensic/commit/32590d4))
- add cc to hotspot analysis ([050c5a5](https://github.com/angular-architects/forensic/commit/050c5a5))
- use dagre layout i/o cola ([653797f](https://github.com/angular-architects/forensic/commit/653797f))
- filter hotspots by score ([bbdcfbf](https://github.com/angular-architects/forensic/commit/bbdcfbf))
- aggregate hotspots ([66c4e50](https://github.com/angular-architects/forensic/commit/66c4e50))
- add change coupling ([a4cd89a](https://github.com/angular-architects/forensic/commit/a4cd89a))
- hotspot ui ([eb943f3](https://github.com/angular-architects/forensic/commit/eb943f3))
- add ui for change coupling ([a161f29](https://github.com/angular-architects/forensic/commit/a161f29))
- infer folder structure from sheriff dump ([453c4e9](https://github.com/angular-architects/forensic/commit/453c4e9))
- handle renames in git history ([5ff8d1b](https://github.com/angular-architects/forensic/commit/5ff8d1b))
- infer sheriff dump when starting detective ([da837a9](https://github.com/angular-architects/forensic/commit/da837a9))
- use latest official sheriff version ([ebbbf48](https://github.com/angular-architects/forensic/commit/ebbbf48))
- add error handling ([d606a37](https://github.com/angular-architects/forensic/commit/d606a37))
- show at least the first two layers in tree ([1a1b191](https://github.com/angular-architects/forensic/commit/1a1b191))
- allow disabling opening a browser window with --open false ([9c240f5](https://github.com/angular-architects/forensic/commit/9c240f5))
- allow limiting forensic analyses by commit cound and time ([0e07635](https://github.com/angular-architects/forensic/commit/0e07635))
- add ui for limiting the git log ([8da81d9](https://github.com/angular-architects/forensic/commit/8da81d9))
- cache git log ([670087a](https://github.com/angular-architects/forensic/commit/670087a))
- auto refresh cache on demand ([80c68b7](https://github.com/angular-architects/forensic/commit/80c68b7))
- allow to choose b/w mc cabe and file length for hotspot analysis ([d25bb57](https://github.com/angular-architects/forensic/commit/d25bb57))
- add by-user option to team-alignment ([bf1e0d9](https://github.com/angular-architects/forensic/commit/bf1e0d9))
- show commits in change-coupling graph ([2b45b50](https://github.com/angular-architects/forensic/commit/2b45b50))
- show total commit count in tool tip text ([3954986](https://github.com/angular-architects/forensic/commit/3954986))
- add loading indicator and pagination to hotspots ([07f7dce](https://github.com/angular-architects/forensic/commit/07f7dce))
- removing chord diagramm from navigation ([6bfe422](https://github.com/angular-architects/forensic/commit/6bfe422))
- add entry point for cli workspace with projects folder ([88266c6](https://github.com/angular-architects/forensic/commit/88266c6))
- add error handlers ([784c750](https://github.com/angular-architects/forensic/commit/784c750))
- add help icons with tooltip texts to the features ([8c6ed74](https://github.com/angular-architects/forensic/commit/8c6ed74))
- improvde default entry points ([256eb47](https://github.com/angular-architects/forensic/commit/256eb47))

### 🩹 Fixes

- make sure initial y >= 0 for graph ([5bd6bc4](https://github.com/angular-architects/forensic/commit/5bd6bc4))
- use trailing / when comparing folders using startsWith ([d61c984](https://github.com/angular-architects/forensic/commit/d61c984))
- min connections cannot be less than 0 ([7e68917](https://github.com/angular-architects/forensic/commit/7e68917))
- normalize paths in sheriff dump ([09d4c53](https://github.com/angular-architects/forensic/commit/09d4c53))
- correct break point observer for filter ([ed57ce0](https://github.com/angular-architects/forensic/commit/ed57ce0))
- add missing files ([026a16f](https://github.com/angular-architects/forensic/commit/026a16f))
- fix tree appearance ([8da2573](https://github.com/angular-architects/forensic/commit/8da2573))

### ❤️ Thank You

- Manfred Steyer
