# Detective

Analyze your TypeScript-based project's architecture.

## Usage

Run these commands in your project root:

```shel
npm i @softarc/sheriff-core -D
npm i /path/to/detective-0.0.1.tgz -D

mkdir .detective
npx sheriff export src/main.ts > .detective/deps.json

npx detective
```