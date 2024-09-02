rm detective-*.tgz
npm pack
npm unpublish --registry http://localhost:4873
npm publish --registry http://localhost:4873