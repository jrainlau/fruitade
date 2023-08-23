const { resolve } = require('path')
const { generatePatchPackage, generateNewVersionPackage } = require('../src/index.js')

// generatePatchPackage({
//   folderOfA: resolve(__dirname, './folderOfA'),
//   folderOfB: resolve(__dirname, './folderOfB'),
//   folderOfPatches: resolve(__dirname, './diffFolder'),
//   doDiffThreshold: 5,
//   getBsdiff: () => require('bsdiff-node'),
// })

// generateNewVersionPackage({
//   folderOfA: resolve(__dirname, './folderOfA'),
//   folderOfPatches: resolve(__dirname, './diffFolder'),
//   folderOfNewVersion: resolve(__dirname, './folderOfNew'),
//   getBsdiff: () => require('bsdiff-node'),
// })
