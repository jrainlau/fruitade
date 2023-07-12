const { resolve } = require('path')
const { generatePatchPackage, generateNewVersionPackage } = require('../src/index.js')

// generatePatchPackage({
//   folderA: resolve(__dirname, './folderA'),
//   folderB: resolve(__dirname, './folderB'),
//   folderPatch: resolve(__dirname, './folderPatch'),
//   doDiffThreshold: 5,
// })

generateNewVersionPackage({
  folderA: resolve(__dirname, './folderA'),
  folderPatch: resolve(__dirname, './folderPatch'),
  folderNew: resolve(__dirname, './folderNew'),
})
