# Developing

`npm run watch-build` watches files changes and runs `npm run build` every time when source file changes.
`npm run watch-test` watches sources and runs `npm run test` (from `test` folder) every time source changes.
`npm run demo` serve code editor usage example `demo.html` and `demo.ts` files. Open http://localhost:1234. Must run in parallel to `watch-build` to get updated on library update.

# Deploying

`npm run generate-parser` generates source code of the parser. Must be called before `npm run build`
`npm run build` generates parser and creates distribution version of the package.
`run run test` runs tests
